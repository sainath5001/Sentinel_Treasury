"use client";

import { ExternalLink } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { usePaymentRequests } from "@/hooks/usePaymentRequests";
import { useTreasuryBalance } from "@/hooks/useTreasuryBalance";
import { PaymentStatus } from "@/types/treasury";
import { EXPLORER_URL } from "@/config/contracts";
import { formatTimestamp, formatTokenAmount, shortenAddress, statusLabel, statusVariant } from "@/lib/utils";

export function TransactionHistory({ limit }: { limit?: number }) {
  const { requests, isLoading } = usePaymentRequests();
  const { decimals, symbol } = useTreasuryBalance();

  const items = limit ? requests.slice(0, limit) : requests;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaction History</CardTitle>
        <CardDescription>On-chain payment request records</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-sm text-slate-500">Loading transactions…</p>
        ) : items.length === 0 ? (
          <p className="text-sm text-slate-500 py-8 text-center">No transactions yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-left text-slate-500">
                  <th className="pb-3 pr-4 font-medium">ID</th>
                  <th className="pb-3 pr-4 font-medium">Recipient</th>
                  <th className="pb-3 pr-4 font-medium">Amount</th>
                  <th className="pb-3 pr-4 font-medium">Status</th>
                  <th className="pb-3 pr-4 font-medium">Created</th>
                  <th className="pb-3 font-medium" />
                </tr>
              </thead>
              <tbody>
                {items.map((req) => (
                  <tr key={req.id.toString()} className="border-b border-slate-800/50">
                    <td className="py-3 pr-4 text-slate-200">#{req.id.toString()}</td>
                    <td className="py-3 pr-4 font-mono text-xs text-slate-400">
                      {shortenAddress(req.recipient)}
                    </td>
                    <td className="py-3 pr-4 text-slate-200">
                      {formatTokenAmount(req.amount, decimals, symbol)}
                    </td>
                    <td className="py-3 pr-4">
                      <Badge variant={statusVariant(req.status)}>{statusLabel(req.status)}</Badge>
                    </td>
                    <td className="py-3 pr-4 text-slate-500 text-xs">
                      {formatTimestamp(req.createdAt)}
                    </td>
                    <td className="py-3">
                      {req.status === PaymentStatus.Executed && (
                        <a
                          href={`${EXPLORER_URL}/address/${req.recipient}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-cyan-400 hover:text-cyan-300"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
