export interface JudgingCriterion {
  id: string;
  category: "Terminal 3" | "AI Agents" | "Security" | "UX" | "Blockchain" | "Enterprise";
  criterion: string;
  whereToDemo: string;
  status: "ready" | "partial" | "manual";
  talkingPoint: string;
}

export const JUDGING_CHECKLIST: JudgingCriterion[] = [
  {
    id: "t3-identity",
    category: "Terminal 3",
    criterion: "Agent DIDs registered with public agent cards",
    whereToDemo: "/agents + /public/agents/*.json",
    status: "ready",
    talkingPoint: "Each agent has did:t3n identity and hosted agent_card.json URI",
  },
  {
    id: "t3-delegation",
    category: "Terminal 3",
    criterion: "Owner delegates scoped actions to agents",
    whereToDemo: "/settings → Terminal 3 Delegations",
    status: "ready",
    talkingPoint: "Per-agent allowedActions mapped to treasury operations",
  },
  {
    id: "t3-protected",
    category: "Terminal 3",
    criterion: "Protected action flow on every agent step",
    whereToDemo: "/agents → Run Agents → T3 trail",
    status: "ready",
    talkingPoint: "verify identity → authorize → sign intent → attestation per step",
  },
  {
    id: "t3-remote",
    category: "Terminal 3",
    criterion: "Live T3 SDK authentication (remote adapter)",
    whereToDemo: "/settings + GET /api/t3/status",
    status: "partial",
    talkingPoint: "RemoteT3Adapter with @terminal3/t3n-sdk when T3_API_KEY configured",
  },
  {
    id: "t3-revoke",
    category: "Terminal 3",
    criterion: "Delegation revocation kill switch",
    whereToDemo: "/settings → Revoke Agent",
    status: "ready",
    talkingPoint: "Revoke treasury agent → next pipeline fails with authorization denied",
  },
  {
    id: "ai-pipeline",
    category: "AI Agents",
    criterion: "Multi-agent orchestration (4 agents)",
    whereToDemo: "/agents → AI Agent Console",
    status: "ready",
    talkingPoint: "Treasury → Compliance → Approval → Audit sequential pipeline",
  },
  {
    id: "ai-nl",
    category: "AI Agents",
    criterion: "Natural language to structured payment",
    whereToDemo: "/agents",
    status: "ready",
    talkingPoint: "GPT-4.1 tool calling extracts recipient, amount, memo",
  },
  {
    id: "ai-explain",
    category: "AI Agents",
    criterion: "Transparent agent reasoning per step",
    whereToDemo: "/agents → pipeline result cards",
    status: "ready",
    talkingPoint: "Each step shows summary, decision badge, and T3 attestation",
  },
  {
    id: "sec-roles",
    category: "Security",
    criterion: "On-chain role-based access control",
    whereToDemo: "/settings → Your Roles",
    status: "ready",
    talkingPoint: "TREASURY, COMPLIANCE, APPROVER roles enforced by smart contract",
  },
  {
    id: "sec-policy",
    category: "Security",
    criterion: "Tiered compliance policy enforcement",
    whereToDemo: "/demo + /agents (tier scenarios)",
    status: "ready",
    talkingPoint: "Deterministic policy tiers layered on AI compliance agent",
  },
  {
    id: "sec-reentrancy",
    category: "Security",
    criterion: "Contract hardening (ReentrancyGuard, SafeERC20)",
    whereToDemo: "/architecture + contracts repo",
    status: "ready",
    talkingPoint: "Foundry tests, 24/24 passing, Sepolia deployment",
  },
  {
    id: "ux-dashboard",
    category: "UX",
    criterion: "Enterprise-grade operational dashboard",
    whereToDemo: "/dashboard",
    status: "ready",
    talkingPoint: "Real-time stats, treasury balance, payment queue, agent feed",
  },
  {
    id: "ux-landing",
    category: "UX",
    criterion: "Professional landing and product pages",
    whereToDemo: "/, /features, /architecture, /demo",
    status: "ready",
    talkingPoint: "Marketing pages explain value before diving into app",
  },
  {
    id: "chain-lifecycle",
    category: "Blockchain",
    criterion: "Full payment lifecycle on-chain",
    whereToDemo: "/requests → Payment Queue",
    status: "ready",
    talkingPoint: "Pending → ComplianceApproved → Approved → Executed",
  },
  {
    id: "chain-sepolia",
    category: "Blockchain",
    criterion: "Live Sepolia deployment with verified contracts",
    whereToDemo: "/treasury → Deployed Contracts",
    status: "ready",
    talkingPoint: "Etherscan links for STT token and TreasuryManager",
  },
  {
    id: "ent-audit",
    category: "Enterprise",
    criterion: "Immutable audit trail",
    whereToDemo: "/audit",
    status: "ready",
    talkingPoint: "Timeline + SHA-256 audit hashes + on-chain event reconstruction",
  },
  {
    id: "ent-scenario",
    category: "Enterprise",
    criterion: "Realistic enterprise scenario (Acme Global)",
    whereToDemo: "/demo",
    status: "ready",
    talkingPoint: "Mock vendors, policy tiers, CFO escalation narrative",
  },
];

export const JUDGING_SCORECARD = {
  terminal3: { weight: 30, items: JUDGING_CHECKLIST.filter((c) => c.category === "Terminal 3") },
  aiAgents: { weight: 25, items: JUDGING_CHECKLIST.filter((c) => c.category === "AI Agents") },
  security: { weight: 20, items: JUDGING_CHECKLIST.filter((c) => c.category === "Security") },
  ux: { weight: 15, items: JUDGING_CHECKLIST.filter((c) => c.category === "UX") },
  blockchain: { weight: 10, items: JUDGING_CHECKLIST.filter((c) => c.category === "Blockchain") },
} as const;
