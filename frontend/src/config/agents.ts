import type { SentinelAgentId, T3Action, T3DelegationRecord } from "@/types/terminal3";

export interface AgentRegistryEntry {
  agentId: SentinelAgentId;
  did: `did:t3n:${string}`;
  displayName: string;
  role: string;
  agentUri: string;
  publicKey: string;
  allowedActions: T3Action[];
}

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

/** Sentinel Treasury agent registry — maps to public agent_card.json files. */
export const AGENT_REGISTRY: Record<SentinelAgentId, AgentRegistryEntry> = {
  treasury: {
    agentId: "treasury",
    did: "did:t3n:treasury-agent-sentinel",
    displayName: "Treasury Agent",
    role: "TREASURY_ROLE",
    agentUri: `${APP_URL}/agents/treasury-agent_card.json`,
    publicKey: "demo-treasury-agent-pubkey",
    allowedActions: ["CREATE_PAYMENT_REQUEST", "READ_TREASURY_STATE"],
  },
  compliance: {
    agentId: "compliance",
    did: "did:t3n:compliance-agent-sentinel",
    displayName: "Compliance Agent",
    role: "COMPLIANCE_ROLE",
    agentUri: `${APP_URL}/agents/compliance-agent_card.json`,
    publicKey: "demo-compliance-agent-pubkey",
    allowedActions: ["RECORD_COMPLIANCE", "READ_TREASURY_STATE"],
  },
  approval: {
    agentId: "approval",
    did: "did:t3n:approval-agent-sentinel",
    displayName: "Approval Agent",
    role: "APPROVER_ROLE",
    agentUri: `${APP_URL}/agents/approval-agent_card.json`,
    publicKey: "demo-approval-agent-pubkey",
    allowedActions: ["EVALUATE_APPROVAL", "READ_TREASURY_STATE"],
  },
  audit: {
    agentId: "audit",
    did: "did:t3n:audit-agent-sentinel",
    displayName: "Audit Agent",
    role: "AUDIT",
    agentUri: `${APP_URL}/agents/audit-agent_card.json`,
    publicKey: "demo-audit-agent-pubkey",
    allowedActions: ["ANCHOR_AUDIT", "READ_TREASURY_STATE"],
  },
};

/** Data-owner DID — use your real T3 DID when T3_ADAPTER=remote. */
export function getOwnerDid(): `did:t3n:${string}` {
  return (process.env.T3_OWNER_DID?.trim() || "did:t3n:sentinel-treasury-owner") as `did:t3n:${string}`;
}

/** @deprecated Prefer getOwnerDid() for runtime env resolution. */
export const OWNER_DID = getOwnerDid();

/** Default delegations — simulates T3 Dashboard grants. */
export function getDefaultDelegations(): T3DelegationRecord[] {
  const ownerDid = getOwnerDid();
  return Object.values(AGENT_REGISTRY).map((agent) => ({
    agentDid: agent.did,
    ownerDid,
    allowedActions: agent.allowedActions,
    contractAddress: "0x9A85abB69efdB975be3b3b5195F4B9f67A5A63D6",
    grantedAt: new Date().toISOString(),
    active: true,
  }));
}

/** @deprecated Prefer getDefaultDelegations() for runtime env resolution. */
export const DEFAULT_DELEGATIONS = getDefaultDelegations();

export function getAgentById(agentId: SentinelAgentId): AgentRegistryEntry {
  return AGENT_REGISTRY[agentId];
}

export function mapAgentNameToId(name: string): SentinelAgentId | null {
  const normalized = name.toLowerCase();
  if (normalized.includes("treasury")) return "treasury";
  if (normalized.includes("compliance")) return "compliance";
  if (normalized.includes("approval")) return "approval";
  if (normalized.includes("audit")) return "audit";
  return null;
}
