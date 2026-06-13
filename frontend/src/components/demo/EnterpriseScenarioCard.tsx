import { Building2, TrendingDown, Users } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DEMO_VENDORS,
  ENTERPRISE_SCENARIO,
  DEMO_PAYMENT_SCENARIOS,
} from "@/content/demo-scenario";

export function EnterpriseScenarioCard() {
  return (
    <div className="space-y-6">
      <Card className="border-cyan-500/20 bg-gradient-to-br from-cyan-500/5 to-slate-950/50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-cyan-400" />
            <CardTitle>{ENTERPRISE_SCENARIO.company}</CardTitle>
          </div>
          <CardDescription>{ENTERPRISE_SCENARIO.tagline}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg border border-slate-800 bg-slate-950/40 p-3">
              <p className="text-xs text-slate-500">Treasury Balance</p>
              <p className="mt-1 text-lg font-semibold text-slate-100">
                {ENTERPRISE_SCENARIO.treasuryBalance}
              </p>
            </div>
            <div className="rounded-lg border border-slate-800 bg-slate-950/40 p-3">
              <p className="text-xs text-slate-500">Monthly Outflow</p>
              <p className="mt-1 text-lg font-semibold text-slate-100">
                {ENTERPRISE_SCENARIO.monthlyOutflow}
              </p>
            </div>
            <div className="rounded-lg border border-slate-800 bg-slate-950/40 p-3">
              <p className="text-xs text-slate-500">Compliance Score</p>
              <p className="mt-1 text-lg font-semibold text-emerald-400">
                {ENTERPRISE_SCENARIO.complianceScore}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-violet-400" />
            Approved Vendors
          </CardTitle>
          <CardDescription>Demo payee directory with risk tiers</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {DEMO_VENDORS.map((vendor) => (
            <div
              key={vendor.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-800 bg-slate-950/40 p-3"
            >
              <div>
                <p className="text-sm font-medium text-slate-200">{vendor.name}</p>
                <p className="text-xs text-slate-500">
                  {vendor.category} · Cap {vendor.monthlyCap}/mo
                </p>
              </div>
              <Badge
                variant={
                  vendor.riskTier === "low"
                    ? "success"
                    : vendor.riskTier === "medium"
                      ? "warning"
                      : "destructive"
                }
              >
                {vendor.riskTier} risk
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5 text-amber-400" />
            Demo Payment Scenarios
          </CardTitle>
          <CardDescription>Three-tier policy demonstration prompts</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {DEMO_PAYMENT_SCENARIOS.map((scenario) => (
            <div
              key={scenario.id}
              className="rounded-lg border border-slate-800 bg-slate-950/40 p-4"
            >
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="info">{scenario.expectedTier}</Badge>
                <span className="font-mono text-xs text-cyan-300">{scenario.amount} STT</span>
              </div>
              <p className="mt-2 font-mono text-sm text-slate-200">&quot;{scenario.prompt}&quot;</p>
              <p className="mt-2 text-xs text-slate-500">{scenario.narrative}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
