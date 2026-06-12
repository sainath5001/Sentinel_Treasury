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
 * Adapter interface abstracting the Terminal 3 SDK / MCP / TEE network.
 *
 * Swap implementations without changing application services:
 * - LocalT3Adapter  → development / hackathon demo
 * - RemoteT3Adapter → production T3 SDK (TODO)
 */
export interface IT3SdkAdapter {
  /** Human-readable adapter name for logging. */
  readonly name: string;

  /** Authenticate with the T3 network node. */
  authenticate(): Promise<void>;

  /** Load and verify an agent identity from T3 registry. */
  verifyIdentity(agentId: SentinelAgentId): Promise<T3AgentIdentity>;

  /** Check whether the agent is authorized for the requested action. */
  authorizeAction(request: T3AuthorizationRequest): Promise<T3AuthorizationResult>;

  /** Sign an intent envelope for a protected action. */
  signIntent(request: T3AuthorizationRequest): Promise<T3SignedIntent>;

  /** List delegations granted to agents by the data owner. */
  listDelegations(agentId?: SentinelAgentId): Promise<T3DelegationRecord[]>;

  /** Revoke an agent's delegation (kill switch). */
  revokeDelegation(agentDid: `did:t3n:${string}`): Promise<void>;

  /** Returns true if the agent has been revoked. */
  isAgentRevoked(agentDid: `did:t3n:${string}`): Promise<boolean>;

  /** Verify a previously issued attestation is still valid. */
  verifyAttestation(attestation: string, action: T3Action): Promise<boolean>;
}

/** Factory type — allows DI in tests and future SDK wiring. */
export type T3SdkAdapterFactory = () => IT3SdkAdapter;
