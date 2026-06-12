export enum PaymentStatus {
  Pending = 0,
  ComplianceApproved = 1,
  Approved = 2,
  Executed = 3,
  Rejected = 4,
}

export interface PaymentRequest {
  id: bigint;
  recipient: `0x${string}`;
  amount: bigint;
  description: string;
  status: PaymentStatus;
  createdAt: bigint;
  executedAt: bigint;
}

export type TreasuryRole = "TREASURY_ROLE" | "COMPLIANCE_ROLE" | "APPROVER_ROLE" | "DEFAULT_ADMIN_ROLE";

export interface AgentActivity {
  id: string;
  agent: string;
  action: string;
  timestamp: Date;
  status: "success" | "pending" | "failed";
  requestId?: string;
}

export interface AuditEvent {
  id: string;
  type: "requested" | "compliance" | "approval" | "execution" | "rejection";
  requestId: string;
  description: string;
  timestamp: Date;
  actor?: string;
}

export interface ComplianceMetric {
  label: string;
  value: string;
  status: "pass" | "warn" | "fail";
}
