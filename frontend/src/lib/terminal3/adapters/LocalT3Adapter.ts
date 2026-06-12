import { createHmac, randomBytes } from "crypto";
import { AGENT_REGISTRY, getDefaultDelegations } from "@/config/agents";
import { CONTRACTS } from "@/config/contracts";
import type { IT3SdkAdapter } from "@/lib/terminal3/adapters/IT3SdkAdapter";
import { globalNonceStore } from "@/lib/terminal3/nonce-store";
import type {
  SentinelAgentId,
  T3Action,
  T3AgentIdentity,
  T3AuthorizationRequest,
  T3AuthorizationResult,
  T3DelegationRecord,
  T3SignedIntent,
} from "@/types/terminal3";

/**
 * Local placeholder adapter for Terminal 3 integration.
 *
 * TODO: Replace with official T3 SDK adapter when SDK access is granted.
 * Contact: enterprise@terminal3.io
 *
 * This adapter simulates:
 * - T3 node authentication
 * - DID identity verification
 * - Delegation-based authorization
 * - HMAC-signed intent envelopes
 * - Agent revocation (kill switch)
 */
export class LocalT3Adapter implements IT3SdkAdapter {
  readonly name = "LocalT3Adapter (placeholder)";

  private authenticated = false;
  private readonly revokedAgents = new Set<string>();
  private delegations: T3DelegationRecord[] = getDefaultDelegations();

  private getSigningSecret(): string {
    // TODO: Load per-agent private keys from secure store (AGENT_IDENTITY_CONFIG_PATH)
    return process.env.T3_SIGNING_SECRET ?? "sentinel-treasury-demo-signing-secret";
  }

  async authenticate(): Promise<void> {
    // TODO: Call T3 SDK authenticate() with node credentials
    // const client = new T3Client({ ... });
    // await client.authenticate();
    this.authenticated = true;
  }

  async verifyIdentity(agentId: SentinelAgentId): Promise<T3AgentIdentity> {
    if (!this.authenticated) await this.authenticate();

    const entry = AGENT_REGISTRY[agentId];
    const revoked = this.revokedAgents.has(entry.did);

    // TODO: Verify against T3 agent registry + ERC-8004 identity registry on-chain
    return {
      agentId,
      did: entry.did,
      displayName: entry.displayName,
      role: entry.role,
      agentUri: entry.agentUri,
      publicKey: entry.publicKey,
      registeredAt: "2026-06-12T00:00:00.000Z",
      active: !revoked,
    };
  }

  async authorizeAction(request: T3AuthorizationRequest): Promise<T3AuthorizationResult> {
    if (!this.authenticated) await this.authenticate();

    if (await this.isAgentRevoked(request.agentDid)) {
      return {
        authorized: false,
        attestation: "",
        expiresAt: 0,
        denialReason: `Agent ${request.agentDid} has been revoked`,
      };
    }

    const delegation = this.delegations.find(
      (d) => d.agentDid === request.agentDid && d.active,
    );

    if (!delegation) {
      return {
        authorized: false,
        attestation: "",
        expiresAt: 0,
        denialReason: `No active delegation for ${request.agentDid}`,
      };
    }

    if (!delegation.allowedActions.includes(request.action)) {
      return {
        authorized: false,
        attestation: "",
        expiresAt: 0,
        denialReason: `Action ${request.action} not delegated to ${request.agentDid}`,
      };
    }

    if (!globalNonceStore.consume(request.agentDid, request.nonce)) {
      return {
        authorized: false,
        attestation: "",
        expiresAt: 0,
        denialReason: "Nonce replay detected",
      };
    }

    const expiresAt = Date.now() + 5 * 60 * 1000;
    const attestation = this.signPayload({
      type: "t3_attestation",
      agentDid: request.agentDid,
      action: request.action,
      payloadHash: request.payloadHash,
      nonce: request.nonce,
      expiresAt,
      contract: request.contractAddress ?? CONTRACTS.treasuryManager,
    });

    return {
      authorized: true,
      attestation,
      expiresAt,
      delegatedBy: delegation.ownerDid,
    };
  }

  async signIntent(request: T3AuthorizationRequest): Promise<T3SignedIntent> {
    const signature = this.signPayload({
      type: "t3_intent",
      agentDid: request.agentDid,
      action: request.action,
      payloadHash: request.payloadHash,
      nonce: request.nonce,
      timestamp: request.timestamp,
    });

    return {
      agentId: request.agentId,
      agentDid: request.agentDid,
      action: request.action,
      payloadHash: request.payloadHash,
      nonce: request.nonce,
      timestamp: request.timestamp,
      signature,
    };
  }

  async listDelegations(agentId?: SentinelAgentId): Promise<T3DelegationRecord[]> {
    if (!agentId) return this.delegations;
    const did = AGENT_REGISTRY[agentId].did;
    return this.delegations.filter((d) => d.agentDid === did);
  }

  async revokeDelegation(agentDid: `did:t3n:${string}`): Promise<void> {
    // TODO: Call T3 Dashboard API / on-chain revocation
    this.revokedAgents.add(agentDid);
    this.delegations = this.delegations.map((d) =>
      d.agentDid === agentDid ? { ...d, active: false, revokedAt: new Date().toISOString() } : d,
    );
  }

  async isAgentRevoked(agentDid: `did:t3n:${string}`): Promise<boolean> {
    return this.revokedAgents.has(agentDid);
  }

  async verifyAttestation(attestation: string, action: T3Action): Promise<boolean> {
    if (!attestation.startsWith("t3.")) return false;
    // TODO: Verify JWT / TEE attestation via T3 SDK
    try {
      const payload = JSON.parse(
        Buffer.from(attestation.split(".")[1] ?? "", "base64url").toString("utf8"),
      );
      return payload.action === action && payload.expiresAt > Date.now();
    } catch {
      return false;
    }
  }

  private signPayload(data: Record<string, unknown>): string {
    const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "T3" })).toString("base64url");
    const body = Buffer.from(JSON.stringify(data)).toString("base64url");
    const sig = createHmac("sha256", this.getSigningSecret())
      .update(`${header}.${body}`)
      .digest("base64url");
    return `t3.${header}.${body}.${sig}`;
  }
}

/** Generate a cryptographically random nonce for intent envelopes. */
export function generateNonce(): string {
  return randomBytes(16).toString("hex");
}
