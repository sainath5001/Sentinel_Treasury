import { actionForAgentStep } from "@/lib/terminal3/utils";
import { ProtectedActionService } from "@/lib/terminal3/protected-action";
import type { SentinelAgentId, T3PipelineAttestation, T3PipelineTrail } from "@/types/terminal3";

/**
 * T3Gateway — high-level facade used by the agent orchestrator.
 * Every agent step passes through this gateway before execution.
 */
export class T3Gateway {
  constructor(private readonly protectedActions = new ProtectedActionService()) {}

  async runAgentStep<T>({
    agentId,
    pipelineStep,
    payload,
    executor,
  }: {
    agentId: SentinelAgentId;
    pipelineStep: string;
    payload: unknown;
    executor: () => Promise<T>;
  }): Promise<{ result: T; attestation: T3PipelineAttestation }> {
    const action = actionForAgentStep(pipelineStep);

    const { result, record, identity } = await this.protectedActions.execute({
      agentId,
      action,
      payload,
      pipelineStep,
      executor,
    });

    return {
      result,
      attestation: {
        agentId,
        agentDid: identity.did,
        action,
        actionId: record.actionId,
        attestation: record.authorization.attestation,
        intentSignature: record.intent.signature,
        payloadHash: record.payloadHash,
        verified: record.status === "executed",
      },
    };
  }

  buildTrail(attestations: T3PipelineAttestation[], ownerDid?: string): T3PipelineTrail {
    return {
      attestations,
      allVerified: attestations.length > 0 && attestations.every((a) => a.verified),
      ownerDid,
    };
  }
}

let gatewaySingleton: T3Gateway | null = null;

export function getT3Gateway(): T3Gateway {
  if (!gatewaySingleton) gatewaySingleton = new T3Gateway();
  return gatewaySingleton;
}
