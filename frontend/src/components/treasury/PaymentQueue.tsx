"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { usePaymentRequests } from "@/hooks/usePaymentRequests";
import { useTreasuryBalance } from "@/hooks/useTreasuryBalance";
import { PaymentStatus } from "@/types/treasury";
import { formatTimestamp, formatTokenAmount, shortenAddress, statusLabel, statusVariant } from "@/lib/utils";

export function PaymentQueue({ limit = 5 }: { limit?: number }) {
  const { requests, isLoading } = usePaymentRequests();
  const { decimals, symbol } = useTreasuryBalance();

  const active = requests
    .filter((r) => r.status !== PaymentStatus.Executed && r.status !== PaymentStatus.Rejected)
    .slice(0, limit);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Queue</CardTitle>
        <CardDescription>Active requests awaiting compliance, approval, or execution</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : active.length === 0 ? (
          <p className="text-sm text-slate-500 py-8 text-center">No active payments in queue</p>
        ) : (
          <div className="space-y-3">
            {active.map((req) => (
              <div
                key={req.id.toString()}
                className="flex items-center justify-between gap-4 rounded-lg border border-violet-500/15 bg-black/50 p-4"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-200">#{req.id.toString()}</span>
                    <Badge variant={statusVariant(req.status)}>{statusLabel(req.status)}</Badge>
                  </div>
                  <p className="mt-1 truncate text-sm text-slate-400">{req.description}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {shortenAddress(req.recipient)} · {formatTimestamp(req.createdAt)}
                  </p>
                </div>
                <p className="shrink-0 text-sm font-semibold text-cyan-300">
                  {formatTokenAmount(req.amount, decimals, symbol)}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
