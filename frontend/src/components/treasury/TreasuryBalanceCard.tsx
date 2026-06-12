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
      <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-cyan-500/10 blur-2xl" />
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardDescription>Vault Balance</CardDescription>
            <CardTitle className="text-2xl mt-1">
              {isLoading ? <Skeleton className="h-8 w-40" /> : formatTokenAmount(balance, decimals, symbol)}
            </CardTitle>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-500/20">
            <Wallet className="h-6 w-6 text-cyan-400" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-lg border border-slate-800 bg-slate-950/40 p-3">
            <p className="text-slate-500 text-xs">Token</p>
            <p className="mt-1 font-medium text-slate-200">{tokenName}</p>
          </div>
          <div className="rounded-lg border border-slate-800 bg-slate-950/40 p-3">
            <p className="text-slate-500 text-xs">Total Supply</p>
            <p className="mt-1 font-medium text-slate-200">
              {isLoading ? "—" : formatTokenAmount(totalSupply, decimals, symbol)}
            </p>
          </div>
        </div>
        <a
          href={`${EXPLORER_URL}/address/${CONTRACTS.treasuryManager}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300"
        >
          Manager {shortenAddress(CONTRACTS.treasuryManager)}
          <ArrowUpRight className="h-3 w-3" />
        </a>
      </CardContent>
    </Card>
  );
}
