import { getAgentById } from "@/config/agents";
import { CONTRACTS } from "@/config/contracts";
import type { Terminal3Client } from "@/lib/terminal3/client";
import { getTerminal3Client } from "@/lib/terminal3/client";
import { generateNonce } from "@/lib/terminal3/adapters/LocalT3Adapter";
import { hashPayload } from "@/lib/terminal3/utils";
import type {
  SentinelAgentId,
  T3Action,
  T3AuthorizationRequest,
  T3AuthorizationResult,
  T3SignedIntent,
} from "@/types/terminal3";

export class AuthorizationDeniedError extends Error {
  constructor(
    public readonly agentId: SentinelAgentId,
    public readonly action: T3Action,
    public readonly reason: string,
  ) {
    super(`Authorization denied for ${agentId}/${action}: ${reason}`);
    this.name = "AuthorizationDeniedError";
  }
}

/**
 * AuthorizationService — verifies delegation permissions and issues attestations.
 */
export class AuthorizationService {
  constructor(private readonly client: Terminal3Client = getTerminal3Client()) {}

  buildAuthorizationRequest(
    agentId: SentinelAgentId,
    action: T3Action,
    payload: unknown,
    contractAddress?: `0x${string}`,
  ): T3AuthorizationRequest {
    const registry = getAgentById(agentId);
    return {
      agentId,
      agentDid: registry.did,
      action,
      payload,
      payloadHash: hashPayload(payload),
      nonce: generateNonce(),
      timestamp: Date.now(),
      contractAddress: contractAddress ?? CONTRACTS.treasuryManager,
    };
  }

  async authorize(request: T3AuthorizationRequest): Promise<T3AuthorizationResult> {
    await this.client.ensureConnected();
    return this.client.getAdapter().authorizeAction(request);
  }

  async authorizeOrThrow(request: T3AuthorizationRequest): Promise<T3AuthorizationResult> {
    const result = await this.authorize(request);
    if (!result.authorized) {
      throw new AuthorizationDeniedError(
        request.agentId,
        request.action,
        result.denialReason ?? "Unknown denial",
      );
    }
    return result;
  }

  async signIntent(request: T3AuthorizationRequest): Promise<T3SignedIntent> {
    await this.client.ensureConnected();
    return this.client.getAdapter().signIntent(request);
  }

  async verifyAttestation(attestation: string, action: T3Action): Promise<boolean> {
    await this.client.ensureConnected();
    return this.client.getAdapter().verifyAttestation(attestation, action);
  }

  async listDelegations(agentId?: SentinelAgentId) {
    await this.client.ensureConnected();
    return this.client.getAdapter().listDelegations(agentId);
  }

  async revokeAgent(agentId: SentinelAgentId): Promise<void> {
    await this.client.ensureConnected();
    const registry = getAgentById(agentId);
    await this.client.getAdapter().revokeDelegation(registry.did);
  }
}
