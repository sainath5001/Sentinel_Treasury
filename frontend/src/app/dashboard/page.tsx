"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { TreasuryBalanceCard } from "@/components/treasury/TreasuryBalanceCard";
import { PaymentQueue } from "@/components/treasury/PaymentQueue";
import { AgentActivityFeed } from "@/components/agents/AgentActivityFeed";
import { ComplianceStatusPanel } from "@/components/compliance/ComplianceStatusPanel";
import { TransactionHistory } from "@/components/treasury/TransactionHistory";
import { T3TrustBanner } from "@/components/terminal3/T3TrustBanner";
import { SecurityPosturePanel } from "@/components/security/SecurityPosturePanel";
import { usePaymentRequests } from "@/hooks/usePaymentRequests";
import { PaymentStatus } from "@/types/treasury";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const { requests } = usePaymentRequests();

  const stats = [
    { label: "Total Requests", value: requests.length },
    {
      label: "Pending Action",
      value: requests.filter(
        (r) => r.status !== PaymentStatus.Executed && r.status !== PaymentStatus.Rejected,
      ).length,
    },
    { label: "Executed", value: requests.filter((r) => r.status === PaymentStatus.Executed).length },
    { label: "Rejected", value: requests.filter((r) => r.status === PaymentStatus.Rejected).length },
  ];

  return (
    <DashboardShell
      title="Dashboard"
      description="Real-time treasury operations and agent oversight"
    >
      <T3TrustBanner />

      <Card className="mb-6 border-violet-500/20 bg-violet-500/5">
        <CardContent className="flex flex-wrap items-center justify-between gap-4 p-4">
          <div>
            <p className="text-sm font-medium text-slate-200">Hackathon Demo Ready</p>
            <p className="text-xs text-slate-500">
              7-step walkthrough · pitch deck · judging checklist · Acme Global scenario
            </p>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/demo">
              Open Demo Kit <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <p className="text-xs text-slate-500 uppercase tracking-wider">{stat.label}</p>
              <p className="mt-1 text-2xl font-semibold text-slate-50">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <TreasuryBalanceCard />
          <PaymentQueue />
          <TransactionHistory limit={5} />
        </div>
        <div className="space-y-6">
          <ComplianceStatusPanel />
          <SecurityPosturePanel />
          <AgentActivityFeed />
        </div>
      </div>
    </DashboardShell>
  );
}
