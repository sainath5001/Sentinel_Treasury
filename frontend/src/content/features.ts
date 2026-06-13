import {
  Bot,
  FileSearch,
  Fingerprint,
  Lock,
  Shield,
  Vault,
  Workflow,
  type LucideIcon,
} from "lucide-react";

export interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
  t3?: boolean;
}

export const PLATFORM_FEATURES: Feature[] = [
  {
    icon: Bot,
    title: "Multi-Agent AI Pipeline",
    description:
      "Four specialized agents — Treasury, Compliance, Approval, and Audit — orchestrated sequentially with GPT-4.1 tool calling. Natural language in, structured payment proposals out.",
  },
  {
    icon: Fingerprint,
    title: "Terminal 3 Agent Identity",
    description:
      "Every agent carries a did:t3n decentralized identifier with a public agent_card.json manifest. Identity is verified before any protected action executes.",
    t3: true,
  },
  {
    icon: Shield,
    title: "Delegation-Based Authorization",
    description:
      "Data owners grant scoped permissions per agent via T3 Dashboard. Each action is checked against active delegations with nonce-based replay protection.",
    t3: true,
  },
  {
    icon: Lock,
    title: "Protected Action Envelopes",
    description:
      "Signed intent envelopes and cryptographic attestations wrap every agent step. Authorization fails closed — no delegation, no execution.",
    t3: true,
  },
  {
    icon: Workflow,
    title: "Tiered Compliance Policy",
    description:
      "Auto-compliant under 100 STT, approver sign-off for 100–1,000 STT, CFO escalation above 1,000 STT. Deterministic rules layered on AI risk assessment.",
  },
  {
    icon: Vault,
    title: "On-Chain Treasury Execution",
    description:
      "TreasuryManager smart contract on Ethereum Sepolia with full payment lifecycle, AccessControl roles, ReentrancyGuard, and SafeERC20 transfers.",
  },
  {
    icon: FileSearch,
    title: "Immutable Audit Trail",
    description:
      "SHA-256 audit hashes, on-chain event reconstruction, and T3 attestation metadata. Every payment traceable from NL intent to chain execution.",
  },
];

export const T3_FEATURES = [
  {
    step: "1",
    title: "Verify Identity",
    description: "AgentIdentityService confirms DID registration and active status",
  },
  {
    step: "2",
    title: "Authorize Action",
    description: "AuthorizationService checks delegation scope and consumes nonce",
  },
  {
    step: "3",
    title: "Sign Intent",
    description: "ProtectedActionService creates signed intent envelope",
  },
  {
    step: "4",
    title: "Issue Attestation",
    description: "Cryptographic attestation bound to payload hash and expiry",
  },
  {
    step: "5",
    title: "Anchor Audit",
    description: "Audit metadata stored in pipeline trail for regulators",
  },
] as const;
