import { getAgentById } from "@/config/agents";
import type { Terminal3Client } from "@/lib/terminal3/client";
import { getTerminal3Client } from "@/lib/terminal3/client";
import type { SentinelAgentId, T3AgentIdentity } from "@/types/terminal3";

export class AgentIdentityVerificationError extends Error {
  constructor(
    public readonly agentId: SentinelAgentId,
    message: string,
  ) {
    super(message);
    this.name = "AgentIdentityVerificationError";
  }
}

/**
 * AgentIdentityService — verifies agent DIDs and loads identity metadata.
 */
export class AgentIdentityService {
  constructor(private readonly client: Terminal3Client = getTerminal3Client()) {}

  async verifyAgent(agentId: SentinelAgentId): Promise<T3AgentIdentity> {
    await this.client.ensureConnected();

    const identity = await this.client.getAdapter().verifyIdentity(agentId);
    const registry = getAgentById(agentId);

    if (identity.did !== registry.did) {
      throw new AgentIdentityVerificationError(
        agentId,
        `DID mismatch: expected ${registry.did}, got ${identity.did}`,
      );
    }

    if (!identity.active) {
      throw new AgentIdentityVerificationError(
        agentId,
        `Agent ${identity.did} is inactive or revoked`,
      );
    }

    return identity;
  }

  async listAllIdentities(): Promise<T3AgentIdentity[]> {
    await this.client.ensureConnected();
    const ids: SentinelAgentId[] = ["treasury", "compliance", "approval", "audit"];
    return Promise.all(ids.map((id) => this.client.getAdapter().verifyIdentity(id)));
  }

  async isAgentActive(agentId: SentinelAgentId): Promise<boolean> {
    const registry = getAgentById(agentId);
    const revoked = await this.client.getAdapter().isAgentRevoked(registry.did);
    return !revoked;
  }
}
