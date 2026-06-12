"use client";

import { DashboardShell } from "@/components/layout/DashboardShell";
import { AuditTimeline } from "@/components/audit/AuditTimeline";
import { AgentActivityFeed } from "@/components/agents/AgentActivityFeed";
import { TransactionHistory } from "@/components/treasury/TransactionHistory";

export default function AuditPage() {
  return (
    <DashboardShell
      title="Audit Center"
      description="Immutable on-chain audit trail and agent action history"
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <AuditTimeline />
        <AgentActivityFeed limit={12} />
      </div>
      <div className="mt-6">
        <TransactionHistory />
      </div>
    </DashboardShell>
  );
}
