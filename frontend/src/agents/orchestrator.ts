import { createPublicClient, formatUnits, http } from "viem";
import { sepolia } from "viem/chains";
import { CONTRACTS } from "@/config/contracts";
import { treasuryManagerAbi } from "@/lib/contracts/abis/treasuryManager";
import { treasuryTokenAbi } from "@/lib/contracts/abis/treasuryToken";
import type { OrchestrateResponse, OrchestratorContext } from "@/types/agents";
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
 * Runs the full 4-agent pipeline: Treasury → Compliance → Approval → Audit.
 */
export async function runOrchestrator(input: OrchestratorInput): Promise<OrchestrateResponse> {
  const treasuryBalance = input.context?.treasuryBalance ?? (await fetchTreasuryBalance());
  const tokenSymbol = input.context?.tokenSymbol ?? "STT";

  // 1. Treasury Agent
  const { proposal } = await runTreasuryAgent({
    message: input.message,
    context: {
      treasuryBalance,
      requesterAddress: input.context?.requesterAddress,
    },
  });

  if (!proposal.parseable || proposal.clarificationsNeeded.length > 0) {
    const clarificationAudit = await runAuditAgent({
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
    });

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
      audit: clarificationAudit.record,
      pipelineStatus: "needs_clarification",
      message: proposal.clarificationsNeeded.join(". ") || "Please clarify your payment request.",
    };
  }

  // 2. Compliance Agent
  const { report: compliance } = await runComplianceAgent({
    proposal,
    treasuryBalance,
  });

  // 3. Approval Agent
  const { decision: approval } = await runApprovalAgent({ proposal, compliance });

  // 4. Audit Agent
  const { record: audit } = await runAuditAgent({
    proposal,
    compliance,
    approval,
    userMessage: input.message,
  });

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
  };
}
