import { createHash } from "crypto";
import type { ChatCompletionTool } from "openai/resources/chat/completions";
import {
  auditRecordSchema,
  type ApprovalDecision,
  type AuditRecord,
  type ComplianceReport,
  type PaymentProposal,
} from "@/types/agents";
import { runToolCall } from "./openai";

const AGENT_ID = "Audit Agent";
const TOOL_NAME = "generate_audit_record";

const SYSTEM_PROMPT = `You are the ${AGENT_ID} for Sentinel Treasury.

Your job is to produce a comprehensive audit record explaining the full agent pipeline for a treasury payment request.

Include:
- A concise executive summary
- Detailed explanation of each agent's role and outcome
- Compliance report narrative
- Risk assessment
- Actionable recommendations

The auditHash field will be overwritten by the system — provide any placeholder string.

Always call the ${TOOL_NAME} tool.`;

const TOOL_DEFINITION: ChatCompletionTool = {
  type: "function",
  function: {
    name: TOOL_NAME,
    description: "Generate an audit record for the complete agent pipeline",
    parameters: {
      type: "object",
      properties: {
        summary: { type: "string" },
        detailedExplanation: { type: "string" },
        complianceReport: { type: "string" },
        actions: {
          type: "array",
          items: {
            type: "object",
            properties: {
              agent: { type: "string" },
              action: { type: "string" },
              timestamp: { type: "string" },
              outcome: { type: "string", enum: ["success", "pending", "failed"] },
            },
            required: ["agent", "action", "timestamp", "outcome"],
          },
        },
        riskAssessment: { type: "string" },
        recommendations: { type: "array", items: { type: "string" } },
        auditHash: { type: "string" },
      },
      required: [
        "summary",
        "detailedExplanation",
        "complianceReport",
        "actions",
        "riskAssessment",
        "recommendations",
        "auditHash",
      ],
      additionalProperties: false,
    },
  },
};

export interface AuditAgentInput {
  proposal: PaymentProposal;
  compliance: ComplianceReport;
  approval: ApprovalDecision;
  userMessage: string;
}

export interface AuditAgentOutput {
  agent: typeof AGENT_ID;
  record: AuditRecord;
}

function computeAuditHash(trail: Record<string, unknown>): string {
  const canonical = JSON.stringify(trail, Object.keys(trail).sort());
  return `0x${createHash("sha256").update(canonical).digest("hex")}`;
}

export async function runAuditAgent(input: AuditAgentInput): Promise<AuditAgentOutput> {
  const now = new Date().toISOString();

  const userPrompt = JSON.stringify(
    {
      userMessage: input.userMessage,
      proposal: input.proposal,
      compliance: input.compliance,
      approval: input.approval,
      timestamp: now,
    },
    null,
    2,
  );

  const { data: llmRecord } = await runToolCall({
    systemPrompt: SYSTEM_PROMPT,
    userPrompt,
    tool: TOOL_DEFINITION,
    schema: auditRecordSchema,
    toolName: TOOL_NAME,
  });

  const trail = {
    userMessage: input.userMessage,
    proposal: input.proposal,
    compliance: input.compliance,
    approval: input.approval,
    actions: llmRecord.actions,
    timestamp: now,
  };

  const auditHash = computeAuditHash(trail);

  const record: AuditRecord = {
    ...llmRecord,
    auditHash,
    actions:
      llmRecord.actions.length > 0
        ? llmRecord.actions
        : [
            { agent: "Treasury Agent", action: "Parsed payment proposal", timestamp: now, outcome: "success" },
            {
              agent: "Compliance Agent",
              action: `Compliance ${input.compliance.passed ? "passed" : "failed"}`,
              timestamp: now,
              outcome: input.compliance.passed ? "success" : "failed",
            },
            {
              agent: "Approval Agent",
              action: `Decision: ${input.approval.decision}`,
              timestamp: now,
              outcome: input.approval.canProceed ? "success" : "failed",
            },
            { agent: "Audit Agent", action: "Generated audit record", timestamp: now, outcome: "success" },
          ],
  };

  return { agent: AGENT_ID, record };
}
