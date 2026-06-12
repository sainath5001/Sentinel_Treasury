import type { ChatCompletionTool } from "openai/resources/chat/completions";
import { TREASURY_POLICIES } from "@/config/policies";
import {
  approvalDecisionSchema,
  type ApprovalDecision,
  type ComplianceReport,
  type PaymentProposal,
} from "@/types/agents";
import { runToolCall } from "./openai";

const AGENT_ID = "Approval Agent";
const TOOL_NAME = "submit_approval_decision";

const SYSTEM_PROMPT = `You are the ${AGENT_ID} for Sentinel Treasury.

Your job is to determine whether a payment can proceed and whether human approval is required.

Decision rules (must follow compliance report):
- If compliance.passed=false → decision=reject, canProceed=false
- If compliance.autoCompliant=true → decision=auto_approve, requiresHumanApproval=false
- If compliance.approvalRequired=true → decision=pending_human, requiresHumanApproval=true
- If compliance.manualEscalation=true → decision=escalate, requiresHumanApproval=true

Generate a clear approvalSummary for human approvers when approval is needed.
Always call the ${TOOL_NAME} tool.`;

const TOOL_DEFINITION: ChatCompletionTool = {
  type: "function",
  function: {
    name: TOOL_NAME,
    description: "Submit an approval decision for a compliance-validated payment",
    parameters: {
      type: "object",
      properties: {
        canProceed: { type: "boolean" },
        requiresHumanApproval: { type: "boolean" },
        autoApproveEligible: { type: "boolean" },
        decision: { type: "string", enum: ["auto_approve", "pending_human", "escalate", "reject"] },
        reason: { type: "string" },
        approvalSummary: { type: "string" },
        approverRole: { type: "string", enum: ["APPROVER", "ADMIN", "NONE"] },
        estimatedProcessingTime: { type: "string" },
      },
      required: [
        "canProceed",
        "requiresHumanApproval",
        "autoApproveEligible",
        "decision",
        "reason",
        "approvalSummary",
        "approverRole",
      ],
      additionalProperties: false,
    },
  },
};

export interface ApprovalAgentInput {
  proposal: PaymentProposal;
  compliance: ComplianceReport;
}

export interface ApprovalAgentOutput {
  agent: typeof AGENT_ID;
  decision: ApprovalDecision;
}

function enforceApprovalDeterministic(
  proposal: PaymentProposal,
  compliance: ComplianceReport,
  llmDecision: ApprovalDecision,
): ApprovalDecision {
  if (!compliance.passed) {
    return {
      canProceed: false,
      requiresHumanApproval: false,
      autoApproveEligible: false,
      decision: "reject",
      reason: compliance.summary,
      approvalSummary: `Payment of ${proposal.amount} ${TREASURY_POLICIES.tokenSymbol} to ${proposal.recipientName} rejected due to compliance failure.`,
      approverRole: "NONE",
    };
  }

  if (compliance.autoCompliant) {
    return {
      canProceed: true,
      requiresHumanApproval: false,
      autoApproveEligible: true,
      decision: "auto_approve",
      reason: `Amount ${proposal.amount} STT is below auto-approve threshold (${TREASURY_POLICIES.autoCompliantMax} STT)`,
      approvalSummary: `Auto-approved: ${proposal.description}`,
      approverRole: "NONE",
      estimatedProcessingTime: "Immediate",
    };
  }

  if (compliance.approvalRequired) {
    return {
      canProceed: true,
      requiresHumanApproval: true,
      autoApproveEligible: false,
      decision: "pending_human",
      reason: llmDecision.reason || `Amount requires human approval (${TREASURY_POLICIES.autoCompliantMax}–${TREASURY_POLICIES.approvalRequiredMax} STT)`,
      approvalSummary:
        llmDecision.approvalSummary ||
        `Approve payment of ${proposal.amount} STT to ${proposal.recipientName} (${proposal.recipientAddress}): ${proposal.description}`,
      approverRole: "APPROVER",
      estimatedProcessingTime: llmDecision.estimatedProcessingTime || "1-2 business hours",
    };
  }

  if (compliance.manualEscalation) {
    return {
      canProceed: true,
      requiresHumanApproval: true,
      autoApproveEligible: false,
      decision: "escalate",
      reason: `Amount ${proposal.amount} STT exceeds ${TREASURY_POLICIES.approvalRequiredMax} STT — manual escalation required`,
      approvalSummary:
        llmDecision.approvalSummary ||
        `ESCALATION: ${proposal.amount} STT payment to ${proposal.recipientName}. Risk score: ${compliance.riskScore}. Review required.`,
      approverRole: "ADMIN",
      estimatedProcessingTime: "24-48 hours",
    };
  }

  return llmDecision;
}

export async function runApprovalAgent(input: ApprovalAgentInput): Promise<ApprovalAgentOutput> {
  const userPrompt = JSON.stringify(
    { proposal: input.proposal, compliance: input.compliance },
    null,
    2,
  );

  const { data: llmDecision } = await runToolCall({
    systemPrompt: SYSTEM_PROMPT,
    userPrompt,
    tool: TOOL_DEFINITION,
    schema: approvalDecisionSchema,
    toolName: TOOL_NAME,
  });

  const decision = enforceApprovalDeterministic(input.proposal, input.compliance, llmDecision);

  return { agent: AGENT_ID, decision };
}
