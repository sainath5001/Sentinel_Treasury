import { z } from "zod";

/** Canonical agent identifiers in Sentinel Treasury. */
export type SentinelAgentId = "treasury" | "compliance" | "approval" | "audit";

/** T3-protected treasury actions. */
export type T3Action =
  | "CREATE_PAYMENT_REQUEST"
  | "RECORD_COMPLIANCE"
  | "EVALUATE_APPROVAL"
  | "ANCHOR_AUDIT"
  | "READ_TREASURY_STATE";

export const t3ActionSchema = z.enum([
  "CREATE_PAYMENT_REQUEST",
  "RECORD_COMPLIANCE",
  "EVALUATE_APPROVAL",
  "ANCHOR_AUDIT",
  "READ_TREASURY_STATE",
]);

export interface T3AgentIdentity {
  agentId: SentinelAgentId;
  did: `did:t3n:${string}`;
  displayName: string;
  role: string;
  evmAddress?: `0x${string}`;
  agentUri: string;
  publicKey: string;
  registeredAt: string;
  active: boolean;
}

export interface T3AuthorizationRequest {
  agentId: SentinelAgentId;
  agentDid: `did:t3n:${string}`;
  action: T3Action;
  payload: unknown;
  payloadHash: `0x${string}`;
  nonce: string;
  timestamp: number;
  contractAddress?: `0x${string}`;
  delegatedBy?: `did:t3n:${string}`;
}

export interface T3AuthorizationResult {
  authorized: boolean;
  attestation: string;
  expiresAt: number;
  delegatedBy?: `did:t3n:${string}`;
  denialReason?: string;
}

export interface T3SignedIntent {
  agentId: SentinelAgentId;
  agentDid: `did:t3n:${string}`;
  action: T3Action;
  payloadHash: `0x${string}`;
  nonce: string;
  timestamp: number;
  signature: string;
}

export interface ProtectedActionRecord {
  actionId: string;
  agentId: SentinelAgentId;
  agentDid: `did:t3n:${string}`;
  action: T3Action;
  payloadHash: `0x${string}`;
  intent: T3SignedIntent;
  authorization: T3AuthorizationResult;
  status: "pending" | "executed" | "blocked" | "revoked";
  createdAt: string;
  executedAt?: string;
  auditMetadata: T3AuditMetadata;
}

export interface T3AuditMetadata {
  agentId: SentinelAgentId;
  agentDid: `did:t3n:${string}`;
  action: T3Action;
  payloadHash: `0x${string}`;
  intentSignature: string;
  attestation: string;
  nonce: string;
  timestamp: string;
  pipelineStep: string;
}

export interface T3DelegationRecord {
  agentDid: `did:t3n:${string}`;
  ownerDid: `did:t3n:${string}`;
  allowedActions: T3Action[];
  contractAddress?: `0x${string}`;
  grantedAt: string;
  revokedAt?: string;
  active: boolean;
}

export const t3PipelineAttestationSchema = z.object({
  agentId: z.enum(["treasury", "compliance", "approval", "audit"]),
  agentDid: z.string(),
  action: t3ActionSchema,
  actionId: z.string(),
  attestation: z.string(),
  intentSignature: z.string(),
  payloadHash: z.string(),
  verified: z.boolean(),
});

export type T3PipelineAttestation = z.infer<typeof t3PipelineAttestationSchema>;

export const t3PipelineTrailSchema = z.object({
  attestations: z.array(t3PipelineAttestationSchema),
  allVerified: z.boolean(),
  ownerDid: z.string().optional(),
});

export type T3PipelineTrail = z.infer<typeof t3PipelineTrailSchema>;
