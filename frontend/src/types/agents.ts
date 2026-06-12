import { z } from "zod";
import { t3PipelineTrailSchema } from "@/types/terminal3";

// ---------------------------------------------------------------------------
// Treasury Agent
// ---------------------------------------------------------------------------

export const paymentProposalSchema = z.object({
  recipientName: z.string().describe("Human-readable payee name if mentioned"),
  recipientAddress: z
    .string()
    .regex(/^0x[a-fA-F0-9]{40}$/, "Must be a valid Ethereum address")
    .nullable()
    .describe("Resolved 0x address; null if unresolved"),
  amount: z.string().describe("Token amount as decimal string, e.g. 100"),
  tokenSymbol: z.string().default("STT"),
  description: z.string().describe("Payment purpose / memo"),
  urgency: z.enum(["normal", "urgent"]).default("normal"),
  confidence: z.number().min(0).max(1).describe("Extraction confidence 0-1"),
  clarificationsNeeded: z.array(z.string()).default([]),
  recommendations: z.array(z.string()).default([]),
  parseable: z.boolean().describe("Whether the request could be structured"),
});

export type PaymentProposal = z.infer<typeof paymentProposalSchema>;

// ---------------------------------------------------------------------------
// Compliance Agent
// ---------------------------------------------------------------------------

export const policyViolationSchema = z.object({
  ruleId: z.string(),
  message: z.string(),
  severity: z.enum(["low", "medium", "high", "critical"]),
});

export const complianceReportSchema = z.object({
  passed: z.boolean(),
  autoCompliant: z.boolean(),
  approvalRequired: z.boolean(),
  manualEscalation: z.boolean(),
  policyTier: z.enum(["auto", "approval", "escalation", "rejected"]),
  violations: z.array(policyViolationSchema).default([]),
  checkedRules: z.array(z.string()).default([]),
  treasuryBalanceSufficient: z.boolean(),
  summary: z.string(),
  riskScore: z.number().min(0).max(100),
});

export type ComplianceReport = z.infer<typeof complianceReportSchema>;
export type PolicyViolation = z.infer<typeof policyViolationSchema>;

// ---------------------------------------------------------------------------
// Approval Agent
// ---------------------------------------------------------------------------

export const approvalDecisionSchema = z.object({
  canProceed: z.boolean(),
  requiresHumanApproval: z.boolean(),
  autoApproveEligible: z.boolean(),
  decision: z.enum(["auto_approve", "pending_human", "escalate", "reject"]),
  reason: z.string(),
  approvalSummary: z.string(),
  approverRole: z.enum(["APPROVER", "ADMIN", "NONE"]).default("NONE"),
  estimatedProcessingTime: z.string().optional(),
});

export type ApprovalDecision = z.infer<typeof approvalDecisionSchema>;

// ---------------------------------------------------------------------------
// Audit Agent
// ---------------------------------------------------------------------------

export const agentActionSchema = z.object({
  agent: z.string(),
  action: z.string(),
  timestamp: z.string(),
  outcome: z.enum(["success", "pending", "failed"]),
});

export const auditRecordSchema = z.object({
  summary: z.string(),
  detailedExplanation: z.string(),
  complianceReport: z.string(),
  actions: z.array(agentActionSchema),
  riskAssessment: z.string(),
  recommendations: z.array(z.string()).default([]),
  auditHash: z.string().describe("Deterministic SHA-256 hex of canonical trail JSON"),
});

export type AuditRecord = z.infer<typeof auditRecordSchema>;
export type AgentAction = z.infer<typeof agentActionSchema>;

// ---------------------------------------------------------------------------
// Orchestrator
// ---------------------------------------------------------------------------

export const orchestrateResponseSchema = z.object({
  proposal: paymentProposalSchema,
  compliance: complianceReportSchema,
  approval: approvalDecisionSchema,
  audit: auditRecordSchema,
  pipelineStatus: z.enum(["completed", "rejected", "needs_clarification", "escalated"]),
  message: z.string(),
  t3: t3PipelineTrailSchema.optional(),
});

export type OrchestrateResponse = z.infer<typeof orchestrateResponseSchema>;

export interface OrchestratorContext {
  treasuryBalance: string;
  tokenSymbol: string;
  requesterAddress?: string;
}
