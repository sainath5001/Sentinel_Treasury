"use client";

import { ArrowUpRight, Wallet } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useTreasuryBalance } from "@/hooks/useTreasuryBalance";
import { CONTRACTS, EXPLORER_URL } from "@/config/contracts";
import { formatTokenAmount, shortenAddress } from "@/lib/utils";

export function TreasuryBalanceCard() {
  const { balance, symbol, decimals, totalSupply, tokenName, isLoading } = useTreasuryBalance();

  return (
    <Card className="relative overflow-hidden">
      <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-violet-500/10 blur-2xl" />
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardDescription>Vault Balance</CardDescription>
            <CardTitle className="mt-1 text-2xl">
              {isLoading ? <Skeleton className="h-8 w-40" /> : formatTokenAmount(balance, decimals, symbol)}
            </CardTitle>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-violet-500/20 bg-violet-500/10">
            <Wallet className="h-6 w-6 text-violet-300" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-lg border border-violet-500/15 bg-black/50 p-3">
            <p className="text-xs text-slate-500">Token</p>
            <p className="mt-1 font-medium text-slate-200">{tokenName}</p>
          </div>
          <div className="rounded-lg border border-violet-500/15 bg-black/50 p-3">
            <p className="text-xs text-slate-500">Total Supply</p>
            <p className="mt-1 font-medium text-slate-200">
              {isLoading ? "—" : formatTokenAmount(totalSupply, decimals, symbol)}
            </p>
          </div>
        </div>
        <a
          href={`${EXPLORER_URL}/address/${CONTRACTS.treasuryManager}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-violet-300 hover:text-violet-200"
        >
          Manager {shortenAddress(CONTRACTS.treasuryManager)}
          <ArrowUpRight className="h-3 w-3" />
        </a>
      </CardContent>
    </Card>
  );
}
