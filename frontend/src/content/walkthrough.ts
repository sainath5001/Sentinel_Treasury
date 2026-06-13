import { DEMO_PAYMENT_SCENARIOS } from "@/content/demo-scenario";

export interface WalkthroughStep {
  step: number;
  title: string;
  description: string;
  route: string;
  action: string;
  judgeNote: string;
  duration: string;
}

export const DEMO_WALKTHROUGH: WalkthroughStep[] = [
  {
    step: 1,
    title: "Landing & Value Proposition",
    description:
      "Open the landing page. Highlight enterprise treasury + verifiable AI agents powered by Terminal 3 identity and delegation.",
    route: "/",
    action: "Show hero, trust strip, and CTA to launch demo",
    judgeNote: "First impression — positions as production-grade, not a toy dApp",
    duration: "1 min",
  },
  {
    step: 2,
    title: "Terminal 3 Identity Layer",
    description:
      "Navigate to Settings → Terminal 3 Delegations. Show owner DID, four agent DIDs, delegation scopes, and remote adapter status.",
    route: "/settings",
    action: "Point out RemoteT3Adapter, owner DID, per-agent allowed actions",
    judgeNote: "Core T3 differentiator — identity → authorization → protected action",
    duration: "2 min",
  },
  {
    step: 3,
    title: "AI Agent Pipeline",
    description:
      "Open Agent Workspace. Run a demo prompt (e.g. Pay Rahul 50 STT). Walk through 4-agent pipeline with T3 attestations per step.",
    route: "/agents",
    action: `Use prompt: "${DEMO_PAYMENT_SCENARIOS[0].prompt}"`,
    judgeNote: "Shows GPT-4.1 orchestration wrapped in T3Gateway protected actions",
    duration: "3 min",
  },
  {
    step: 4,
    title: "On-Chain Treasury Execution",
    description:
      "Submit payment on-chain from agent result. Show Sepolia transaction, payment request lifecycle on TreasuryManager contract.",
    route: "/agents",
    action: "Click Submit On-Chain Payment Request, then open Payment Requests",
    judgeNote: "Proves end-to-end: NL → agents → T3 → smart contract",
    duration: "2 min",
  },
  {
    step: 5,
    title: "Compliance & Approval Gates",
    description:
      "Demonstrate tiered policy: run 500 STT (approval) and 1500 STT (escalation) scenarios. Show role-gated actions in Approval Center.",
    route: "/requests",
    action: "Run tier-2 and tier-3 demo prompts, approve with connected wallet",
    judgeNote: "Enterprise controls — not all payments are auto-approved",
    duration: "3 min",
  },
  {
    step: 6,
    title: "Kill Switch & Revocation",
    description:
      "Revoke Treasury Agent delegation in Settings. Re-run pipeline — authorization denied with T3_AUTHORIZATION_DENIED.",
    route: "/settings",
    action: "Revoke Treasury Agent, retry payment in Agent Workspace",
    judgeNote: "Security story — instant delegation revocation",
    duration: "2 min",
  },
  {
    step: 7,
    title: "Audit Trail & Transparency",
    description:
      "Open Audit Center. Show immutable timeline, agent activity feed, SHA-256 audit hashes, and T3 attestation metadata.",
    route: "/audit",
    action: "Walk audit timeline and link events to on-chain request IDs",
    judgeNote: "Auditability for regulators and enterprise CTOs",
    duration: "2 min",
  },
];

export const DEMO_SCRIPT_INTRO =
  "Sentinel Treasury is an enterprise autonomous treasury platform where every AI agent action is identity-verified, delegation-authorized, and audit-anchored via Terminal 3 — before touching on-chain treasury contracts on Ethereum Sepolia.";
