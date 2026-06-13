import { createPublicClient, formatUnits, http } from "viem";
import { sepolia } from "viem/chains";
import { getOwnerDid } from "@/config/agents";
import { CONTRACTS } from "@/config/contracts";
import { treasuryManagerAbi } from "@/lib/contracts/abis/treasuryManager";
import { treasuryTokenAbi } from "@/lib/contracts/abis/treasuryToken";
import { getT3Gateway } from "@/lib/terminal3";
import { AuthorizationDeniedError } from "@/lib/terminal3/authorization";
import type { OrchestrateResponse, OrchestratorContext } from "@/types/agents";
import type { T3PipelineAttestation } from "@/types/terminal3";
import {
  buildDemoApprovalDecision,
  buildDemoAuditRecord,
  buildDemoComplianceReport,
  isDemoAgentMode,
  isOpenAIQuotaError,
  parseDemoPaymentProposal,
} from "./demo-parser";
import { runTreasuryAgent } from "./treasuryAgent";
import { runComplianceAgent } from "./complianceAgent";
import { runApprovalAgent } from "./approvalAgent";
import { runAuditAgent } from "./auditAgent";

export interface OrchestratorInput {
  message: string;
  context?: Partial<OrchestratorContext>;
}

async function fetchTreasuryBalance(): Promise<string> {
  const rpcUrl = process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL ?? process.env.SEPOLIA_RPC_URL;
  if (!rpcUrl) return "1000000";

  const client = createPublicClient({
    chain: sepolia,
    transport: http(rpcUrl),
  });

  const [balance, decimals] = await Promise.all([
    client.readContract({
      address: CONTRACTS.treasuryManager,
      abi: treasuryManagerAbi,
      functionName: "treasuryBalance",
    }),
    client.readContract({
      address: CONTRACTS.treasuryToken,
      abi: treasuryTokenAbi,
      functionName: "decimals",
    }),
  ]);

  return formatUnits(balance, decimals);
}

/**
 * Runs the full 4-agent pipeline with Terminal 3 protection on every step:
 * Treasury → Compliance → Approval → Audit
 */
export async function runOrchestrator(input: OrchestratorInput): Promise<OrchestrateResponse> {
  if (isDemoAgentMode()) {
    return runOrchestratorDemo(input);
  }

  try {
    return await runOrchestratorLive(input);
  } catch (error) {
    if (isOpenAIQuotaError(error)) {
      console.warn("[orchestrate] OpenAI quota exceeded — falling back to demo mode");
      return runOrchestratorDemo(input, "OpenAI quota exceeded — running in demo mode (no API credits)");
    }
    throw error;
  }
}

async function runOrchestratorDemo(
  input: OrchestratorInput,
  quotaNotice?: string,
): Promise<OrchestrateResponse> {
  const t3 = getT3Gateway();
  const attestations: T3PipelineAttestation[] = [];
  const treasuryBalance = input.context?.treasuryBalance ?? (await fetchTreasuryBalance());
  const tokenSymbol = input.context?.tokenSymbol ?? "STT";

  const treasuryStep = await t3.runAgentStep({
    agentId: "treasury",
    pipelineStep: "treasury",
    payload: { message: input.message, treasuryBalance, mode: "demo" },
    executor: async () => ({
      agent: "Treasury Agent" as const,
      proposal: parseDemoPaymentProposal(input.message),
    }),
  });
  attestations.push(treasuryStep.attestation);
  const { proposal } = treasuryStep.result;

  if (!proposal.parseable || proposal.clarificationsNeeded.length > 0) {
    const auditStep = await t3.runAgentStep({
      agentId: "audit",
      pipelineStep: "audit",
      payload: { proposal, status: "needs_clarification", mode: "demo" },
      executor: async () => ({
        agent: "Audit Agent" as const,
        record: buildDemoAuditRecord({
          userMessage: input.message,
          proposal,
          compliance: {
            passed: false,
            autoCompliant: false,
            approvalRequired: false,
            manualEscalation: false,
            policyTier: "rejected",
            violations: [],
            checkedRules: [],
            treasuryBalanceSufficient: true,
            summary: "Awaiting clarification",
            riskScore: 0,
          },
          approval: {
            canProceed: false,
            requiresHumanApproval: false,
            autoApproveEligible: false,
            decision: "reject",
            reason: "Incomplete request",
            approvalSummary: "",
            approverRole: "NONE",
          },
        }),
      }),
    });
    attestations.push(auditStep.attestation);

    return {
      proposal,
      compliance: {
        passed: false,
        autoCompliant: false,
        approvalRequired: false,
        manualEscalation: false,
        policyTier: "rejected",
        violations: [
          {
            ruleId: "CLARIFICATION_NEEDED",
            message: proposal.clarificationsNeeded.join("; ") || "Request could not be parsed",
            severity: "medium",
          },
        ],
        checkedRules: ["PARSE_VALIDATION"],
        treasuryBalanceSufficient: true,
        summary: "Clarification required before compliance check",
        riskScore: 10,
      },
      approval: {
        canProceed: false,
        requiresHumanApproval: false,
        autoApproveEligible: false,
        decision: "reject",
        reason: "Awaiting user clarification",
        approvalSummary: proposal.clarificationsNeeded.join(". "),
        approverRole: "NONE",
      },
      audit: auditStep.result.record,
      pipelineStatus: "needs_clarification",
      message:
        quotaNotice ??
        (proposal.clarificationsNeeded.join(". ") || "Please clarify your payment request."),
      agentMode: "demo",
      t3: t3.buildTrail(attestations, getOwnerDid()),
    };
  }

  const complianceStep = await t3.runAgentStep({
    agentId: "compliance",
    pipelineStep: "compliance",
    payload: { proposal, treasuryBalance, mode: "demo" },
    executor: async () => ({
      agent: "Compliance Agent" as const,
      report: buildDemoComplianceReport(proposal, treasuryBalance),
    }),
  });
  attestations.push(complianceStep.attestation);
  const { report: compliance } = complianceStep.result;

  const approvalStep = await t3.runAgentStep({
    agentId: "approval",
    pipelineStep: "approval",
    payload: { proposal, compliance, mode: "demo" },
    executor: async () => ({
      agent: "Approval Agent" as const,
      decision: buildDemoApprovalDecision(proposal, compliance),
    }),
  });
  attestations.push(approvalStep.attestation);
  const { decision: approval } = approvalStep.result;

  const auditStep = await t3.runAgentStep({
    agentId: "audit",
    pipelineStep: "audit",
    payload: { proposal, compliance, approval, userMessage: input.message, mode: "demo" },
    executor: async () => ({
      agent: "Audit Agent" as const,
      record: buildDemoAuditRecord({
        userMessage: input.message,
        proposal,
        compliance,
        approval,
      }),
    }),
  });
  attestations.push(auditStep.attestation);
  const { record: audit } = auditStep.result;

  let pipelineStatus: OrchestrateResponse["pipelineStatus"] = "completed";
  if (!compliance.passed) pipelineStatus = "rejected";
  else if (approval.decision === "escalate") pipelineStatus = "escalated";

  const baseMessage =
    pipelineStatus === "rejected"
      ? compliance.summary
      : approval.requiresHumanApproval
        ? approval.approvalSummary
        : `Payment proposal ready: ${proposal.amount} ${tokenSymbol} to ${proposal.recipientName}`;

  return {
    proposal,
    compliance,
    approval,
    audit,
    pipelineStatus,
    message: quotaNotice ? `${baseMessage} (${quotaNotice})` : baseMessage,
    agentMode: "demo",
    t3: t3.buildTrail(attestations, getOwnerDid()),
  };
}

async function runOrchestratorLive(input: OrchestratorInput): Promise<OrchestrateResponse> {
  const t3 = getT3Gateway();
  const attestations: T3PipelineAttestation[] = [];
  const treasuryBalance = input.context?.treasuryBalance ?? (await fetchTreasuryBalance());
  const tokenSymbol = input.context?.tokenSymbol ?? "STT";

  try {
    // 1. Treasury Agent (T3-protected)
    const treasuryStep = await t3.runAgentStep({
      agentId: "treasury",
      pipelineStep: "treasury",
      payload: { message: input.message, treasuryBalance },
      executor: () =>
        runTreasuryAgent({
          message: input.message,
          context: {
            treasuryBalance,
            requesterAddress: input.context?.requesterAddress,
          },
        }),
    });
    attestations.push(treasuryStep.attestation);
    const { proposal } = treasuryStep.result;

    if (!proposal.parseable || proposal.clarificationsNeeded.length > 0) {
      const auditStep = await t3.runAgentStep({
        agentId: "audit",
        pipelineStep: "audit",
        payload: { proposal, status: "needs_clarification" },
        executor: () =>
          runAuditAgent({
            proposal,
            compliance: {
              passed: false,
              autoCompliant: false,
              approvalRequired: false,
              manualEscalation: false,
              policyTier: "rejected",
              violations: [],
              checkedRules: [],
              treasuryBalanceSufficient: true,
              summary: "Awaiting clarification",
              riskScore: 0,
            },
            approval: {
              canProceed: false,
              requiresHumanApproval: false,
              autoApproveEligible: false,
              decision: "reject",
              reason: "Incomplete request",
              approvalSummary: "",
              approverRole: "NONE",
            },
            userMessage: input.message,
          }),
      });
      attestations.push(auditStep.attestation);

      return {
        proposal,
        compliance: {
          passed: false,
          autoCompliant: false,
          approvalRequired: false,
          manualEscalation: false,
          policyTier: "rejected",
          violations: [
            {
              ruleId: "CLARIFICATION_NEEDED",
              message: proposal.clarificationsNeeded.join("; ") || "Request could not be parsed",
              severity: "medium",
            },
          ],
          checkedRules: ["PARSE_VALIDATION"],
          treasuryBalanceSufficient: true,
          summary: "Clarification required before compliance check",
          riskScore: 10,
        },
        approval: {
          canProceed: false,
          requiresHumanApproval: false,
          autoApproveEligible: false,
          decision: "reject",
          reason: "Awaiting user clarification",
          approvalSummary: proposal.clarificationsNeeded.join(". "),
          approverRole: "NONE",
        },
        audit: auditStep.result.record,
        pipelineStatus: "needs_clarification",
        message: proposal.clarificationsNeeded.join(". ") || "Please clarify your payment request.",
        t3: t3.buildTrail(attestations, getOwnerDid()),
      };
    }

    // 2. Compliance Agent (T3-protected)
    const complianceStep = await t3.runAgentStep({
      agentId: "compliance",
      pipelineStep: "compliance",
      payload: { proposal, treasuryBalance },
      executor: () => runComplianceAgent({ proposal, treasuryBalance }),
    });
    attestations.push(complianceStep.attestation);
    const { report: compliance } = complianceStep.result;

    // 3. Approval Agent (T3-protected)
    const approvalStep = await t3.runAgentStep({
      agentId: "approval",
      pipelineStep: "approval",
      payload: { proposal, compliance },
      executor: () => runApprovalAgent({ proposal, compliance }),
    });
    attestations.push(approvalStep.attestation);
    const { decision: approval } = approvalStep.result;

    // 4. Audit Agent (T3-protected)
    const auditStep = await t3.runAgentStep({
      agentId: "audit",
      pipelineStep: "audit",
      payload: { proposal, compliance, approval, userMessage: input.message },
      executor: () =>
        runAuditAgent({ proposal, compliance, approval, userMessage: input.message }),
    });
    attestations.push(auditStep.attestation);
    const { record: audit } = auditStep.result;

    let pipelineStatus: OrchestrateResponse["pipelineStatus"] = "completed";
    if (!compliance.passed) pipelineStatus = "rejected";
    else if (approval.decision === "escalate") pipelineStatus = "escalated";
    else if (approval.requiresHumanApproval) pipelineStatus = "completed";

    const message =
      pipelineStatus === "rejected"
        ? compliance.summary
        : approval.requiresHumanApproval
          ? approval.approvalSummary
          : `Payment proposal ready: ${proposal.amount} ${tokenSymbol} to ${proposal.recipientName}`;

    return {
      proposal,
      compliance,
      approval,
      audit,
      pipelineStatus,
      message,
      t3: t3.buildTrail(attestations, getOwnerDid()),
    };
  } catch (error) {
    if (error instanceof AuthorizationDeniedError) {
      return {
        proposal: {
          recipientName: "",
          recipientAddress: null,
          amount: "0",
          tokenSymbol: "STT",
          description: "",
          urgency: "normal",
          confidence: 0,
          clarificationsNeeded: [],
          recommendations: [],
          parseable: false,
        },
        compliance: {
          passed: false,
          autoCompliant: false,
          approvalRequired: false,
          manualEscalation: false,
          policyTier: "rejected",
          violations: [
            {
              ruleId: "T3_AUTHORIZATION_DENIED",
              message: error.message,
              severity: "critical",
            },
          ],
          checkedRules: ["T3_IDENTITY", "T3_AUTHORIZATION"],
          treasuryBalanceSufficient: false,
          summary: error.message,
          riskScore: 100,
        },
        approval: {
          canProceed: false,
          requiresHumanApproval: false,
          autoApproveEligible: false,
          decision: "reject",
          reason: error.message,
          approvalSummary: "",
          approverRole: "NONE",
        },
        audit: {
          summary: "Pipeline blocked by Terminal 3 authorization",
          detailedExplanation: error.message,
          complianceReport: "T3 gate blocked execution",
          actions: [],
          riskAssessment: "Critical — unauthorized agent action",
          recommendations: ["Verify agent delegation in T3 Dashboard", "Check agent revocation status"],
          auditHash: "0x0",
        },
        pipelineStatus: "rejected",
        message: error.message,
        t3: t3.buildTrail(attestations, getOwnerDid()),
      };
    }
    throw error;
  }
}
