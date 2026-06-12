/** Treasury policy thresholds in STT (18 decimals applied at runtime). */
export const TREASURY_POLICIES = {
  tokenSymbol: "STT",
  tokenAliases: ["STT", "TTK", "SENTINEL"],
  decimals: 18,

  /** Under this amount: auto-compliant, no human approval */
  autoCompliantMax: 100,

  /** 100–1000: human approval required */
  approvalRequiredMax: 1000,

  /** Above approvalRequiredMax: manual escalation */
  maxSingleTransfer: 10_000,

  allowedRecipients: [] as `0x${string}`[],
} as const;

export type PolicyTier = "auto" | "approval" | "escalation" | "rejected";

export function getPolicyTier(amount: number): PolicyTier {
  if (amount <= 0) return "rejected";
  if (amount < TREASURY_POLICIES.autoCompliantMax) return "auto";
  if (amount <= TREASURY_POLICIES.approvalRequiredMax) return "approval";
  if (amount <= TREASURY_POLICIES.maxSingleTransfer) return "escalation";
  return "rejected";
}

export function formatPolicyRulesForPrompt(): string {
  return `
Treasury Policy Rules (token: ${TREASURY_POLICIES.tokenSymbol}, aliases: ${TREASURY_POLICIES.tokenAliases.join(", ")}):
- Under ${TREASURY_POLICIES.autoCompliantMax} ${TREASURY_POLICIES.tokenSymbol}: AUTO COMPLIANT (no human approval)
- ${TREASURY_POLICIES.autoCompliantMax}–${TREASURY_POLICIES.approvalRequiredMax} ${TREASURY_POLICIES.tokenSymbol}: APPROVAL REQUIRED
- Above ${TREASURY_POLICIES.approvalRequiredMax} ${TREASURY_POLICIES.tokenSymbol}: MANUAL ESCALATION
- Maximum single transfer: ${TREASURY_POLICIES.maxSingleTransfer} ${TREASURY_POLICIES.tokenSymbol}
`.trim();
}
