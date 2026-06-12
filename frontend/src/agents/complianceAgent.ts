import type { ChatCompletionTool } from "openai/resources/chat/completions";
import { formatPolicyRulesForPrompt, getPolicyTier, TREASURY_POLICIES } from "@/config/policies";
import {
  complianceReportSchema,
  type ComplianceReport,
  type PaymentProposal,
} from "@/types/agents";
import { runToolCall } from "./openai";

const AGENT_ID = "Compliance Agent";
const TOOL_NAME = "submit_compliance_report";

const SYSTEM_PROMPT = `You are the ${AGENT_ID} for Sentinel Treasury.

Your job is to evaluate payment proposals against treasury policies and produce a compliance report.

${formatPolicyRulesForPrompt()}

Additional checks:
- Verify treasury balance is sufficient for the payment
- Flag any policy violations with rule IDs
- Assign a risk score 0-100 based on amount, recipient familiarity, and policy tier
- autoCompliant=true only when amount is UNDER ${TREASURY_POLICIES.autoCompliantMax} STT and balance is sufficient
- approvalRequired=true when amount is ${TREASURY_POLICIES.autoCompliantMax}–${TREASURY_POLICIES.approvalRequiredMax} STT
- manualEscalation=true when amount EXCEEDS ${TREASURY_POLICIES.approvalRequiredMax} STT

Always call the ${TOOL_NAME} tool. Be strict — policy enforcement is not optional.`;

const TOOL_DEFINITION: ChatCompletionTool = {
  type: "function",
  function: {
    name: TOOL_NAME,
    description: "Submit a compliance evaluation report for a payment proposal",
    parameters: {
      type: "object",
      properties: {
        passed: { type: "boolean" },
        autoCompliant: { type: "boolean" },
        approvalRequired: { type: "boolean" },
        manualEscalation: { type: "boolean" },
        policyTier: { type: "string", enum: ["auto", "approval", "escalation", "rejected"] },
        violations: {
          type: "array",
          items: {
            type: "object",
            properties: {
              ruleId: { type: "string" },
              message: { type: "string" },
              severity: { type: "string", enum: ["low", "medium", "high", "critical"] },
            },
            required: ["ruleId", "message", "severity"],
          },
        },
        checkedRules: { type: "array", items: { type: "string" } },
        treasuryBalanceSufficient: { type: "boolean" },
        summary: { type: "string" },
        riskScore: { type: "number" },
      },
      required: [
        "passed",
        "autoCompliant",
        "approvalRequired",
        "manualEscalation",
        "policyTier",
        "violations",
        "checkedRules",
        "treasuryBalanceSufficient",
        "summary",
        "riskScore",
      ],
      additionalProperties: false,
    },
  },
};

export interface ComplianceAgentInput {
  proposal: PaymentProposal;
  treasuryBalance: string;
}

export interface ComplianceAgentOutput {
  agent: typeof AGENT_ID;
  report: ComplianceReport;
}

/**
 * Deterministic policy enforcement — LLM interprets, code enforces final truth.
 */
function enforceComplianceDeterministic(
  proposal: PaymentProposal,
  treasuryBalance: string,
  llmReport: ComplianceReport,
): ComplianceReport {
  const amount = Number.parseFloat(proposal.amount);
  const balance = Number.parseFloat(treasuryBalance);
  const tier = getPolicyTier(amount);
  const violations = [...llmReport.violations];

  if (!proposal.recipientAddress) {
    violations.push({
      ruleId: "PAYEE_UNRESOLVED",
      message: "Recipient address could not be resolved",
      severity: "critical",
    });
  }

  if (Number.isNaN(amount) || amount <= 0) {
    violations.push({
      ruleId: "INVALID_AMOUNT",
      message: "Payment amount must be positive",
      severity: "critical",
    });
  }

  if (amount > TREASURY_POLICIES.maxSingleTransfer) {
    violations.push({
      ruleId: "MAX_SINGLE_TRANSFER",
      message: `Amount exceeds maximum single transfer of ${TREASURY_POLICIES.maxSingleTransfer} STT`,
      severity: "critical",
    });
  }

  const balanceSufficient = !Number.isNaN(balance) && balance >= amount;
  if (!balanceSufficient) {
    violations.push({
      ruleId: "INSUFFICIENT_BALANCE",
      message: `Treasury balance ${treasuryBalance} STT insufficient for ${proposal.amount} STT`,
      severity: "critical",
    });
  }

  const hasCritical = violations.some((v) => v.severity === "critical");
  const passed = !hasCritical && balanceSufficient && !!proposal.recipientAddress;

  return {
    passed,
    autoCompliant: passed && tier === "auto",
    approvalRequired: passed && tier === "approval",
    manualEscalation: passed && tier === "escalation",
    policyTier: passed ? tier : "rejected",
    violations,
    checkedRules: [
      "AUTO_COMPLIANT_THRESHOLD",
      "APPROVAL_THRESHOLD",
      "ESCALATION_THRESHOLD",
      "MAX_SINGLE_TRANSFER",
      "TREASURY_BALANCE",
      "PAYEE_RESOLUTION",
      ...llmReport.checkedRules,
    ],
    treasuryBalanceSufficient: balanceSufficient,
    summary: passed
      ? llmReport.summary
      : `Compliance failed: ${violations.map((v) => v.message).join("; ")}`,
    riskScore: hasCritical ? Math.max(llmReport.riskScore, 80) : llmReport.riskScore,
  };
}

export async function runComplianceAgent(input: ComplianceAgentInput): Promise<ComplianceAgentOutput> {
  const userPrompt = JSON.stringify(
    {
      proposal: input.proposal,
      treasuryBalance: input.treasuryBalance,
      tokenSymbol: TREASURY_POLICIES.tokenSymbol,
    },
    null,
    2,
  );

  const { data: llmReport } = await runToolCall({
    systemPrompt: SYSTEM_PROMPT,
    userPrompt,
    tool: TOOL_DEFINITION,
    schema: complianceReportSchema,
    toolName: TOOL_NAME,
  });

  const report = enforceComplianceDeterministic(input.proposal, input.treasuryBalance, llmReport);

  return { agent: AGENT_ID, report };
}
