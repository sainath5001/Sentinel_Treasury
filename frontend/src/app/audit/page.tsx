"use client";

import { DashboardShell } from "@/components/layout/DashboardShell";
import { AuditTimeline } from "@/components/audit/AuditTimeline";
import { AgentActivityFeed } from "@/components/agents/AgentActivityFeed";
import { TransactionHistory } from "@/components/treasury/TransactionHistory";
import { T3TrustBanner } from "@/components/terminal3/T3TrustBanner";
import { ProtectedActionFlow } from "@/components/terminal3/ProtectedActionFlow";

export default function AuditPage() {
  return (
    <DashboardShell
      title="Audit Center"
      description="Immutable on-chain audit trail and agent action history"
    >
      <T3TrustBanner />

      <div className="grid gap-6 lg:grid-cols-2">
        <AuditTimeline />
        <div className="space-y-6">
          <ProtectedActionFlow />
          <AgentActivityFeed limit={12} />
        </div>
      </div>
      <div className="mt-6">
        <TransactionHistory />
      </div>
    </DashboardShell>
  );
}
