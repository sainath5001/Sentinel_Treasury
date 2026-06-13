export interface PitchSlide {
  id: string;
  title: string;
  subtitle?: string;
  bullets: string[];
  highlight?: string;
}

export const PITCH_DECK: PitchSlide[] = [
  {
    id: "problem",
    title: "The Problem",
    subtitle: "Enterprise treasury is stuck between manual ops and blind automation",
    bullets: [
      "Treasury teams process thousands of payments with fragmented approval workflows",
      "AI agents can act fast — but lack verifiable identity, authorization, and audit trails",
      "CFOs cannot delegate to autonomous systems without cryptographic accountability",
      "Regulators demand explainability: who authorized what, when, and under which policy",
    ],
    highlight: "$12T+ in annual B2B payments still rely on email + spreadsheets",
  },
  {
    id: "solution",
    title: "Sentinel Treasury",
    subtitle: "Autonomous treasury with trusted agents and verifiable authorization",
    bullets: [
      "Natural language → structured payment proposals via GPT-4.1 multi-agent pipeline",
      "Every agent step protected by Terminal 3: identity, delegation, signed intent, attestation",
      "On-chain execution on Ethereum with role-based AccessControl and immutable lifecycle",
      "Tiered compliance: auto (<100 STT), approval (100–1K), escalation (>1K)",
    ],
    highlight: "AI speed + enterprise controls + cryptographic proof",
  },
  {
    id: "t3",
    title: "Terminal 3 Integration",
    subtitle: "The trust layer that makes autonomous agents enterprise-ready",
    bullets: [
      "4 registered agent DIDs with public agent_card.json manifests",
      "Owner delegates scoped actions per agent via T3 Dashboard",
      "T3Gateway wraps every orchestrator step: verify → authorize → sign → audit",
      "RemoteT3Adapter: live @terminal3/t3n-sdk handshake + ETH authentication",
      "Kill switch: revoke delegation → pipeline fails closed",
    ],
    highlight: "identity → authorization → protected action → audit",
  },
  {
    id: "architecture",
    title: "Architecture",
    subtitle: "No database — chain state + events + verifiable agent trail",
    bullets: [
      "Frontend: Next.js 16, wagmi, RainbowKit on Sepolia",
      "Smart contracts: TreasuryToken (STT) + TreasuryManager lifecycle",
      "Agents: Treasury → Compliance → Approval → Audit (orchestrated server-side)",
      "T3: swappable adapter pattern (LocalT3 / RemoteT3)",
      "Audit: SHA-256 hashes + on-chain payment events + T3 attestations",
    ],
  },
  {
    id: "demo",
    title: "Live Demo Flow",
    bullets: [
      '"Pay Rahul 50 STT" → 4 agents → T3 attestations → on-chain request',
      "500 STT triggers approver workflow; 1500 STT escalates to CFO",
      "Revoke agent → authorization denied instantly",
      "Full audit timeline reconstructed from contract + agent metadata",
    ],
    highlight: "3-minute wow moment: NL payment with visible T3 trail",
  },
  {
    id: "market",
    title: "Market & Vision",
    bullets: [
      "Target: mid-market and enterprise treasury teams adopting AI automation",
      "Composable with existing ERP/AP systems via agent APIs",
      "T3 network provides cross-org identity and delegation portability",
      "Roadmap: multi-chain, ERP connectors, SOC2 audit exports, TEE contracts",
    ],
    highlight: "The control plane for autonomous enterprise finance",
  },
  {
    id: "ask",
    title: "Why Sentinel Wins",
    bullets: [
      "Only hackathon submission combining GPT agents + T3 + on-chain treasury",
      "Production-shaped UX: not a CLI demo — full enterprise dashboard",
      "Security-first: fails closed, role-gated, revocable delegations",
      "Every claim is demonstrable live on Sepolia testnet",
    ],
    highlight: "Built for judges who care about T3, security, and real enterprise UX",
  },
];
