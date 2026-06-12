"use client";

import { AlertTriangle, CheckCircle2, Shield } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { usePaymentRequests } from "@/hooks/usePaymentRequests";
import { useTreasuryBalance } from "@/hooks/useTreasuryBalance";
import { PaymentStatus } from "@/types/treasury";
import type { ComplianceMetric } from "@/types/treasury";

export function ComplianceStatusPanel() {
  const { requests } = usePaymentRequests();
  const { balance, totalSupply } = useTreasuryBalance();

  const pending = requests.filter((r) => r.status === PaymentStatus.Pending).length;
  const rejected = requests.filter((r) => r.status === PaymentStatus.Rejected).length;
  const executed = requests.filter((r) => r.status === PaymentStatus.Executed).length;
  const utilization = totalSupply > 0n ? Number((balance * 100n) / totalSupply) : 0;

  const metrics: ComplianceMetric[] = [
    {
      label: "Policy Engine",
      value: "Active",
      status: "pass",
    },
    {
      label: "Pending Reviews",
      value: pending.toString(),
      status: pending > 3 ? "warn" : "pass",
    },
    {
      label: "Rejection Rate",
      value: requests.length > 0 ? `${Math.round((rejected / requests.length) * 100)}%` : "0%",
      status: rejected > 0 ? "warn" : "pass",
    },
    {
      label: "Vault Utilization",
      value: `${utilization.toFixed(1)}%`,
      status: utilization < 90 ? "pass" : "warn",
    },
    {
      label: "Executed Payments",
      value: executed.toString(),
      status: "pass",
    },
    {
      label: "Terminal 3 Identity",
      value: "Delegated",
      status: "pass",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <Shield className="h-5 w-5 text-emerald-400" />
          </div>
          <div>
            <CardTitle>Compliance Status</CardTitle>
            <CardDescription>Real-time policy and governance health</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2">
          {metrics.map((metric) => (
            <div
              key={metric.label}
              className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950/40 px-4 py-3"
            >
              <div className="flex items-center gap-2">
                {metric.status === "pass" ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-amber-400" />
                )}
                <span className="text-sm text-slate-400">{metric.label}</span>
              </div>
              <Badge variant={metric.status === "pass" ? "success" : "warning"}>{metric.value}</Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
