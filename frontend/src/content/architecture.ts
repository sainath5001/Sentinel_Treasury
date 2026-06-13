export const ARCHITECTURE_LAYERS = [
  {
    name: "Presentation",
    tech: "Next.js 16 · Tailwind v4 · RainbowKit",
    components: ["Dashboard", "Agent Workspace", "Audit Center", "T3 Settings"],
    color: "cyan",
  },
  {
    name: "AI Orchestration",
    tech: "GPT-4.1 · Zod schemas · Server API routes",
    components: ["Treasury Agent", "Compliance Agent", "Approval Agent", "Audit Agent"],
    color: "violet",
  },
  {
    name: "Terminal 3 Gateway",
    tech: "@terminal3/t3n-sdk · IT3SdkAdapter",
    components: ["Identity Service", "Authorization Service", "Protected Action Service"],
    color: "emerald",
  },
  {
    name: "Blockchain",
    tech: "Solidity · Foundry · Ethereum Sepolia",
    components: ["TreasuryToken (STT)", "TreasuryManager", "AccessControl Roles"],
    color: "amber",
  },
] as const;

export const DATA_FLOWS = [
  {
    id: "nl-payment",
    title: "Natural Language Payment",
    steps: [
      "User enters NL request in Agent Workspace",
      "POST /api/orchestrate → 4-agent pipeline",
      "Each step passes through T3Gateway.runAgentStep()",
      "Treasury Agent returns PaymentProposal",
      "Compliance / Approval / Audit agents evaluate",
      "Response includes T3 trail with attestations",
      "User submits on-chain via wagmi writeContract",
    ],
  },
  {
    id: "t3-protected",
    title: "T3 Protected Action",
    steps: [
      "Verify agent DID against registry",
      "Check delegation allows action for contract",
      "Consume nonce (replay protection)",
      "Sign intent envelope with server secret",
      "Issue time-bound attestation",
      "Record audit metadata in pipeline trail",
    ],
  },
  {
    id: "on-chain",
    title: "On-Chain Lifecycle",
    steps: [
      "createPaymentRequest → Pending",
      "validateCompliance → ComplianceApproved",
      "approveRequest → Approved",
      "executePayment → Executed (STT transfer)",
      "rejectRequest → Rejected (any stage)",
    ],
  },
] as const;

export const SECURITY_CONTROLS = [
  { control: "Fails Closed", detail: "No delegation or revoked agent → authorization denied" },
  { control: "Nonce Replay Protection", detail: "Per-agent nonce store prevents attestation reuse" },
  { control: "Role Gating", detail: "TREASURY, COMPLIANCE, APPROVER roles on-chain" },
  { control: "ReentrancyGuard", detail: "TreasuryManager protected against reentrancy" },
  { control: "SafeERC20", detail: "Token transfers via OpenZeppelin SafeERC20" },
  { control: "Kill Switch", detail: "T3 delegation revocation blocks agent immediately" },
  { control: "Audit Hashing", detail: "SHA-256 over full pipeline metadata" },
  { control: "Server-Only Keys", detail: "OpenAI + T3 API keys never exposed to client" },
] as const;
