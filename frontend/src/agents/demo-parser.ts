import { resolveRecipientName } from "@/config/recipients";
import { getPolicyTier, TREASURY_POLICIES } from "@/config/policies";
import type {
  ApprovalDecision,
  AuditRecord,
  ComplianceReport,
  PaymentProposal,
} from "@/types/agents";
import { createHash } from "crypto";

const ETH_ADDRESS = /0x[a-fA-F0-9]{40}/;

/** True when AGENT_MODE=demo or OpenAI should be skipped. */
export function isDemoAgentMode(): boolean {
  return process.env.AGENT_MODE?.trim().toLowerCase() === "demo";
}

export function isOpenAIQuotaError(error: unknown): boolean {
  const msg = error instanceof Error ? error.message : String(error);
  return (
    msg.includes("429") ||
    msg.includes("quota") ||
    msg.includes("insufficient_quota") ||
    msg.includes("billing")
  );
}

/**
 * Deterministic NL parser — no OpenAI required.
 * Handles demo prompts like "Pay Rahul 50 STT for invoice #1042".
 */
export function parseDemoPaymentProposal(message: string): PaymentProposal {
  const trimmed = message.trim();
  const lower = trimmed.toLowerCase();

  let amount = "";
  let recipientName = "";
  let recipientAddress: `0x${string}` | null = null;

  const directAddr = trimmed.match(ETH_ADDRESS);
  if (directAddr) {
    recipientAddress = directAddr[0] as `0x${string}`;
    recipientName = "Direct address";
  }

  const amountMatch =
    trimmed.match(/(\d+(?:\.\d+)?)\s*(?:STT|stt|TTK|ttk|sentinel)/i) ??
    trimmed.match(/(?:pay|send|transfer)\s+(\d+(?:\.\d+)?)/i);

  if (amountMatch) amount = amountMatch[1];

  if (!recipientAddress) {
    const nameAfterPay = trimmed.match(
      /(?:pay|send|transfer)\s+([a-zA-Z][a-zA-Z0-9_-]*)\s+\d/i,
    );
    const nameAfterTo = trimmed.match(
      /(?:to|for)\s+([a-zA-Z][a-zA-Z0-9_-]*)(?:\s+\d|\s*$)/i,
    );

    recipientName = (nameAfterPay?.[1] ?? nameAfterTo?.[1] ?? "").trim();
    if (recipientName) {
      const resolved = resolveRecipientName(recipientName);
      if (resolved) recipientAddress = resolved;
    }
  }

  const forMatch = trimmed.match(/\bfor\s+(.+)$/i);
  const description = forMatch?.[1]?.trim() || trimmed;

  const parseable =
    !!amount &&
    Number.parseFloat(amount) > 0 &&
    (!!recipientAddress || !!recipientName);

  const clarificationsNeeded: string[] = [];
  if (!amount) clarificationsNeeded.push("Please specify the payment amount in STT");
  if (!recipientAddress && !recipientName) {
    clarificationsNeeded.push("Please specify a payee name or 0x wallet address");
  } else if (!recipientAddress) {
    clarificationsNeeded.push(
      `Could not resolve payee "${recipientName}" — use rahul, vendor, alice, bob, or a 0x address`,
    );
  }

  return {
    recipientName: recipientName || (recipientAddress ? "Direct address" : ""),
    recipientAddress,
    amount: amount || "0",
    tokenSymbol: TREASURY_POLICIES.tokenSymbol,
    description,
    urgency: lower.includes("urgent") ? "urgent" : "normal",
    confidence: parseable && recipientAddress ? 0.92 : 0.5,
    clarificationsNeeded,
    recommendations: parseable
      ? ["Payment eligible for T3-protected agent pipeline"]
      : [],
    parseable: parseable && clarificationsNeeded.length === 0,
  };
}

export function buildDemoComplianceReport(
  proposal: PaymentProposal,
  treasuryBalance: string,
): ComplianceReport {
  const amount = Number.parseFloat(proposal.amount);
  const balance = Number.parseFloat(treasuryBalance);
  const tier = getPolicyTier(amount);
  const violations: ComplianceReport["violations"] = [];

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
      message: `Amount exceeds maximum of ${TREASURY_POLICIES.maxSingleTransfer} STT`,
      severity: "critical",
    });
  }

  const balanceSufficient = !Number.isNaN(balance) && balance >= amount;
  if (!balanceSufficient) {
    violations.push({
      ruleId: "INSUFFICIENT_BALANCE",
      message: `Treasury balance insufficient for ${proposal.amount} STT`,
      severity: "critical",
    });
  }

  const hasCritical = violations.some((v) => v.severity === "critical");
  const passed = !hasCritical && balanceSufficient && !!proposal.recipientAddress;

  const riskScore =
    tier === "auto" ? 15 : tier === "approval" ? 45 : tier === "escalation" ? 72 : 90;

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
    ],
    treasuryBalanceSufficient: balanceSufficient,
    summary: passed
      ? `Compliance passed — ${amount} STT is in the "${tier}" policy tier (demo mode, no OpenAI)`
      : `Compliance failed: ${violations.map((v) => v.message).join("; ")}`,
    riskScore: hasCritical ? Math.max(riskScore, 80) : riskScore,
  };
}

export function buildDemoApprovalDecision(
  proposal: PaymentProposal,
  compliance: ComplianceReport,
): ApprovalDecision {
  if (!compliance.passed) {
    return {
      canProceed: false,
      requiresHumanApproval: false,
      autoApproveEligible: false,
      decision: "reject",
      reason: compliance.summary,
      approvalSummary: `Payment to ${proposal.recipientName} rejected.`,
      approverRole: "NONE",
    };
  }
  if (compliance.autoCompliant) {
    return {
      canProceed: true,
      requiresHumanApproval: false,
      autoApproveEligible: true,
      decision: "auto_approve",
      reason: `Amount ${proposal.amount} STT is below auto-approve threshold`,
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
      reason: "Amount requires human approver sign-off",
      approvalSummary: `Approve ${proposal.amount} STT to ${proposal.recipientName}: ${proposal.description}`,
      approverRole: "APPROVER",
      estimatedProcessingTime: "1-2 business hours",
    };
  }
  return {
    canProceed: true,
    requiresHumanApproval: true,
    autoApproveEligible: false,
    decision: "escalate",
    reason: "High-value payment requires CFO escalation",
    approvalSummary: `ESCALATION: ${proposal.amount} STT to ${proposal.recipientName}`,
    approverRole: "ADMIN",
    estimatedProcessingTime: "24-48 hours",
  };
}

export function buildDemoAuditRecord(
  input: {
    userMessage: string;
    proposal: PaymentProposal;
    compliance: ComplianceReport;
    approval: ApprovalDecision;
  },
): AuditRecord {
  const now = new Date().toISOString();
  const actions = [
    {
      agent: "Treasury Agent",
      action: "Parsed payment proposal (demo mode)",
      timestamp: now,
      outcome: "success" as const,
    },
    {
      agent: "Compliance Agent",
      action: `Compliance ${input.compliance.passed ? "passed" : "failed"}`,
      timestamp: now,
      outcome: input.compliance.passed ? ("success" as const) : ("failed" as const),
    },
    {
      agent: "Approval Agent",
      action: `Decision: ${input.approval.decision}`,
      timestamp: now,
      outcome: input.approval.canProceed ? ("success" as const) : ("failed" as const),
    },
    {
      agent: "Audit Agent",
      action: "Generated audit record",
      timestamp: now,
      outcome: "success" as const,
    },
  ];

  const trail = {
    userMessage: input.userMessage,
    proposal: input.proposal,
    compliance: input.compliance,
    approval: input.approval,
    actions,
    timestamp: now,
    mode: "demo",
  };

  const auditHash = `0x${createHash("sha256")
    .update(JSON.stringify(trail, Object.keys(trail).sort()))
    .digest("hex")}`;

  return {
    summary: `Audit complete for ${input.proposal.amount} STT payment to ${input.proposal.recipientName}`,
    detailedExplanation:
      "Demo mode pipeline ran without OpenAI. Treasury parsed the request locally, compliance and approval used deterministic policy rules, and T3 attestations were still issued.",
    complianceReport: input.compliance.summary,
    actions,
    riskAssessment: `Risk score ${input.compliance.riskScore}/100 — tier ${input.compliance.policyTier}`,
    recommendations: [
      "Add OpenAI credits for full GPT-4.1 agent reasoning",
      "Or keep AGENT_MODE=demo for offline hackathon demos",
    ],
    auditHash,
  };
}
