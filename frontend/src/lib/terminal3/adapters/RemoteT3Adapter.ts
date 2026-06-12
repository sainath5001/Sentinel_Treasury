import { createHmac, randomBytes } from "crypto";
import { AGENT_REGISTRY, getDefaultDelegations, getOwnerDid } from "@/config/agents";
import { CONTRACTS } from "@/config/contracts";
import type { IT3SdkAdapter } from "@/lib/terminal3/adapters/IT3SdkAdapter";
import { generateNonce } from "@/lib/terminal3/adapters/LocalT3Adapter";
import { globalNonceStore } from "@/lib/terminal3/nonce-store";
import { getT3SdkSession } from "@/lib/terminal3/t3-sdk-session";
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
 * Production adapter backed by @terminal3/t3n-sdk.
 *
 * Authenticates the data-owner identity against the T3 network, then applies
 * Sentinel Treasury delegation policy for the four pipeline agents.
 */
export class RemoteT3Adapter implements IT3SdkAdapter {
  readonly name = "RemoteT3Adapter (@terminal3/t3n-sdk)";

  private authenticated = false;
  private ownerDid: `did:t3n:${string}` = getOwnerDid();
  private nodeUrl = "";
  private ethAddress = "";
  private readonly revokedAgents = new Set<string>();
  private delegations: T3DelegationRecord[] = getDefaultDelegations();

  private getSigningSecret(): string {
    return process.env.T3_SIGNING_SECRET ?? process.env.T3_API_KEY ?? "sentinel-treasury-remote-signing";
  }

  async authenticate(): Promise<void> {
    const session = await getT3SdkSession();
    this.ownerDid = session.ownerDid;
    this.nodeUrl = session.nodeUrl;
    this.ethAddress = session.ethAddress;
    this.delegations = getDefaultDelegations().map((delegation) => ({
      ...delegation,
      ownerDid: this.ownerDid,
    }));
    this.authenticated = true;
  }

  async verifyIdentity(agentId: SentinelAgentId): Promise<T3AgentIdentity> {
    if (!this.authenticated) await this.authenticate();

    const entry = AGENT_REGISTRY[agentId];
    const revoked = this.revokedAgents.has(entry.did);

    return {
      agentId,
      did: entry.did,
      displayName: entry.displayName,
      role: entry.role,
      agentUri: entry.agentUri,
      publicKey: entry.publicKey,
      registeredAt: new Date().toISOString(),
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
      adapter: "remote",
      ownerDid: this.ownerDid,
      nodeUrl: this.nodeUrl,
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
      adapter: "remote",
      ownerDid: this.ownerDid,
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
    if (!this.authenticated) await this.authenticate();
    if (!agentId) return this.delegations;
    const did = AGENT_REGISTRY[agentId].did;
    return this.delegations.filter((d) => d.agentDid === did);
  }

  async revokeDelegation(agentDid: `did:t3n:${string}`): Promise<void> {
    if (!this.authenticated) await this.authenticate();

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
    try {
      const payload = JSON.parse(
        Buffer.from(attestation.split(".")[1] ?? "", "base64url").toString("utf8"),
      );
      return payload.action === action && payload.expiresAt > Date.now();
    } catch {
      return false;
    }
  }

  getConnectionInfo() {
    return {
      ownerDid: this.ownerDid,
      nodeUrl: this.nodeUrl,
      ethAddress: this.ethAddress,
      authenticated: this.authenticated,
    };
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

export { generateNonce };
