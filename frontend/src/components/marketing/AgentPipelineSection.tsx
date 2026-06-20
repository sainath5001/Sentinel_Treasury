"use client";

import { Bot, FileSearch, MessageSquare, Shield, UserCheck, Vault } from "lucide-react";
import { RadialOrbitalTimeline, type TimelineItem } from "@/components/ui/radial-orbital-timeline";

const pipelineTimeline: TimelineItem[] = [
  {
    id: 1,
    title: "Natural Language",
    date: "Step 1",
    content:
      "User submits a payment intent in plain English. The orchestrator receives the request and begins the protected agent pipeline.",
    category: "Input",
    icon: MessageSquare,
    relatedIds: [2],
    status: "completed",
    energy: 100,
  },
  {
    id: 2,
    title: "Treasury Agent",
    date: "Step 2",
    content:
      "Parses intent into a structured payment proposal — recipient, amount, and description — wrapped by T3Gateway identity and delegation checks.",
    category: "Agent",
    icon: Bot,
    relatedIds: [3],
    status: "completed",
    energy: 95,
  },
  {
    id: 3,
    title: "Compliance Agent",
    date: "Step 3",
    content:
      "Evaluates tiered policy rules: auto-compliant under 100 STT, approver sign-off for 100–1,000 STT, CFO escalation above 1,000 STT.",
    category: "Agent",
    icon: Shield,
    relatedIds: [4],
    status: "completed",
    energy: 90,
  },
  {
    id: 4,
    title: "Approval Agent",
    date: "Step 4",
    content:
      "Determines whether human approval is required based on compliance tier and issues an authorization decision with T3 attestation.",
    category: "Agent",
    icon: UserCheck,
    relatedIds: [5],
    status: "in-progress",
    energy: 85,
  },
  {
    id: 5,
    title: "Audit Agent",
    date: "Step 5",
    content:
      "Anchors SHA-256 audit metadata and T3 attestation trail for every pipeline step — identity → authorization → protected action.",
    category: "Agent",
    icon: FileSearch,
    relatedIds: [6],
    status: "pending",
    energy: 80,
  },
  {
    id: 6,
    title: "On-Chain",
    date: "Step 6",
    content:
      "Approved payments execute on Ethereum Sepolia via TreasuryManager — Pending → ComplianceApproved → Approved → Executed.",
    category: "Output",
    icon: Vault,
    relatedIds: [],
    status: "pending",
    energy: 100,
  },
];

export function AgentPipelineSection() {
  return (
    <section className="relative overflow-hidden border-t border-violet-500/10 bg-black">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-1/2 h-[80vmin] w-[80vmin] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(191,128,255,0.12),transparent_50%)] blur-[30px]"
      />

      <div className="relative z-10 mx-auto max-w-6xl px-4 pt-16 pb-4 text-center lg:px-8">
        <h2 className="text-2xl font-bold text-slate-50 sm:text-3xl">
          Natural language → verified agents → on-chain execution
        </h2>
        <p className="mt-3 text-slate-400">
          Every step identity-verified and delegation-authorized via Terminal 3
        </p>
        <p className="mt-2 text-xs text-slate-500">
          Click any node — T3Gateway: identity → authorization → signed intent → attestation
        </p>
      </div>

      <div className="relative z-10">
        <RadialOrbitalTimeline timelineData={pipelineTimeline} />
      </div>
    </section>
  );
}
