"use client";

import { DashboardShell } from "@/components/layout/DashboardShell";
import { TreasuryBalanceCard } from "@/components/treasury/TreasuryBalanceCard";
import { ComplianceStatusPanel } from "@/components/compliance/ComplianceStatusPanel";
import { TransactionHistory } from "@/components/treasury/TransactionHistory";
import { CONTRACTS, EXPLORER_URL } from "@/config/contracts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { shortenAddress } from "@/lib/utils";

export default function TreasuryPage() {
  return (
    <DashboardShell
      title="Treasury Overview"
      description="Vault balances, contract addresses, and fund utilization"
    >
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <TreasuryBalanceCard />
          <TransactionHistory />
        </div>
        <div className="space-y-6">
          <ComplianceStatusPanel />
          <Card>
            <CardHeader>
              <CardTitle>Deployed Contracts</CardTitle>
              <CardDescription>Sepolia mainnet deployment</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ContractRow
                label="Treasury Token (STT)"
                address={CONTRACTS.treasuryToken}
              />
              <ContractRow
                label="Treasury Manager"
                address={CONTRACTS.treasuryManager}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardShell>
  );
}

function ContractRow({ label, address }: { label: string; address: string }) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-950/40 p-3">
      <p className="text-xs text-slate-500">{label}</p>
      <a
        href={`${EXPLORER_URL}/address/${address}`}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-1 block font-mono text-sm text-cyan-400 hover:text-cyan-300"
      >
        {shortenAddress(address, 6)}
      </a>
    </div>
  );
}
