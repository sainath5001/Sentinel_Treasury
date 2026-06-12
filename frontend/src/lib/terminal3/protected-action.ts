import type { AgentIdentityService } from "@/lib/terminal3/identity";
import { AgentIdentityService as IdentityService } from "@/lib/terminal3/identity";
import type { AuthorizationService } from "@/lib/terminal3/authorization";
import { AuthorizationService as AuthService } from "@/lib/terminal3/authorization";
import { createActionId } from "@/lib/terminal3/utils";
import type {
  SentinelAgentId,
  T3Action,
  T3AgentIdentity,
  T3AuditMetadata,
  T3AuthorizationResult,
  ProtectedActionRecord,
  T3SignedIntent,
} from "@/types/terminal3";

export interface ExecuteProtectedActionParams<T> {
  agentId: SentinelAgentId;
  action: T3Action;
  payload: unknown;
  pipelineStep: string;
  contractAddress?: `0x${string}`;
  executor: () => Promise<T>;
}

export interface ProtectedActionResult<T> {
  result: T;
  record: ProtectedActionRecord;
  identity: T3AgentIdentity;
}

/**
 * ProtectedActionService — orchestrates the 5-step T3 payment action flow:
 * 1. Verify identity
 * 2. Verify authorization
 * 3. Create protected action
 * 4. Record agent identity
 * 5. Generate audit metadata
 */
export class ProtectedActionService {
  constructor(
    private readonly identityService: AgentIdentityService = new IdentityService(),
    private readonly authorizationService: AuthorizationService = new AuthService(),
  ) {}

  async execute<T>(params: ExecuteProtectedActionParams<T>): Promise<ProtectedActionResult<T>> {
    const actionId = createActionId();

    // 1. Verify identity
    const identity = await this.identityService.verifyAgent(params.agentId);

    // 2. Build authorization request
    const authRequest = this.authorizationService.buildAuthorizationRequest(
      params.agentId,
      params.action,
      params.payload,
      params.contractAddress,
    );

    // 3. Verify authorization + sign intent
    const authorization = await this.authorizationService.authorizeOrThrow(authRequest);
    const intent = await this.authorizationService.signIntent(authRequest);

    // 4. Create protected action record (pre-execution)
    const auditMetadata = this.buildAuditMetadata(
      params.agentId,
      identity,
      params.action,
      authRequest.payloadHash,
      intent,
      authorization,
      params.pipelineStep,
    );

    const record: ProtectedActionRecord = {
      actionId,
      agentId: params.agentId,
      agentDid: identity.did,
      action: params.action,
      payloadHash: authRequest.payloadHash,
      intent,
      authorization,
      status: "pending",
      createdAt: new Date().toISOString(),
      auditMetadata,
    };

    const result = await params.executor();

    return {
      result,
      record: {
        ...record,
        status: "executed",
        executedAt: new Date().toISOString(),
      },
      identity,
    };
  }

  private buildAuditMetadata(
    agentId: SentinelAgentId,
    identity: T3AgentIdentity,
    action: T3Action,
    payloadHash: `0x${string}`,
    intent: T3SignedIntent,
    authorization: T3AuthorizationResult,
    pipelineStep: string,
  ): T3AuditMetadata {
    return {
      agentId,
      agentDid: identity.did,
      action,
      payloadHash,
      intentSignature: intent.signature,
      attestation: authorization.attestation,
      nonce: intent.nonce,
      timestamp: new Date().toISOString(),
      pipelineStep,
    };
  }
}
