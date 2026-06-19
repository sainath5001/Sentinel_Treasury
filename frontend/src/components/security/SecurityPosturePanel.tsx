"use client";

import { Lock, Shield, ShieldAlert, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SECURITY_CONTROLS } from "@/content/architecture";
import { POLICY_THRESHOLDS } from "@/content/demo-scenario";

export function SecurityPosturePanel() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-emerald-400" />
          <CardTitle>Security Posture</CardTitle>
        </div>
        <CardDescription>Enterprise controls and compliance policy tiers</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
            Policy Tiers
          </p>
          {POLICY_THRESHOLDS.map((tier) => (
            <div
              key={tier.range}
              className="flex items-center justify-between rounded-lg border border-violet-500/15 bg-black/50 px-3 py-2"
            >
              <span className="font-mono text-xs text-slate-300">{tier.range}</span>
              <Badge
                variant={
                  tier.color === "emerald"
                    ? "success"
                    : tier.color === "amber"
                      ? "warning"
                      : "destructive"
                }
              >
                {tier.behavior}
              </Badge>
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
            Active Controls
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {SECURITY_CONTROLS.slice(0, 6).map((item) => (
              <div
                key={item.control}
                className="flex items-start gap-2 rounded-lg border border-violet-500/15 bg-black/50 p-2.5"
              >
                <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-violet-300" />
                <div>
                  <p className="text-xs font-medium text-slate-200">{item.control}</p>
                  <p className="text-[10px] text-slate-500">{item.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-3 py-2">
          <Shield className="h-4 w-4 text-emerald-400" />
          <p className="text-xs text-emerald-300">
            Fails closed — no valid T3 delegation means no agent execution
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2">
          <ShieldAlert className="h-4 w-4 text-amber-400" />
          <p className="text-xs text-amber-300">
            Kill switch available — revoke any agent in Settings
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
