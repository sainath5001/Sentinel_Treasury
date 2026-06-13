import Link from "next/link";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { PipelineDiagram } from "@/components/marketing/PipelineDiagram";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ARCHITECTURE_LAYERS,
  DATA_FLOWS,
  SECURITY_CONTROLS,
} from "@/content/architecture";
import { CONTRACTS } from "@/config/contracts";

const LAYER_COLORS: Record<string, string> = {
  cyan: "border-cyan-500/30 bg-cyan-500/10",
  violet: "border-violet-500/30 bg-violet-500/10",
  emerald: "border-emerald-500/30 bg-emerald-500/10",
  amber: "border-amber-500/30 bg-amber-500/10",
};

export default function ArchitecturePage() {
  return (
    <MarketingShell>
      <div className="mx-auto max-w-6xl px-4 py-16 lg:px-8">
        <div className="max-w-2xl">
          <Badge variant="info" className="mb-4">System Architecture</Badge>
          <h1 className="text-3xl font-bold text-slate-50 sm:text-4xl">
            Four layers, zero database, full auditability
          </h1>
          <p className="mt-4 text-slate-400 leading-relaxed">
            Chain state + agent events + T3 attestations. No hidden state — every payment
            traceable from natural language intent to Sepolia execution.
          </p>
        </div>

        <div className="mt-12 space-y-4">
          {ARCHITECTURE_LAYERS.map((layer) => (
            <Card key={layer.name} className={LAYER_COLORS[layer.color]}>
              <CardContent className="flex flex-wrap items-center justify-between gap-4 p-5">
                <div>
                  <p className="text-lg font-semibold text-slate-100">{layer.name}</p>
                  <p className="text-sm text-slate-400">{layer.tech}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {layer.components.map((c) => (
                    <Badge key={c} variant="default">{c}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-bold text-slate-50 mb-6">Agent Pipeline</h2>
          <PipelineDiagram />
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {DATA_FLOWS.map((flow) => (
            <Card key={flow.id}>
              <CardHeader>
                <CardTitle className="text-base">{flow.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="space-y-2">
                  {flow.steps.map((step, i) => (
                    <li key={step} className="flex gap-2 text-xs text-slate-400">
                      <span className="font-mono text-cyan-400">{i + 1}.</span>
                      {step}
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mt-12">
          <CardHeader>
            <CardTitle>Deployed Contracts — Sepolia</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 font-mono text-sm">
            <div className="flex flex-wrap justify-between gap-2 rounded-lg border border-slate-800 bg-slate-950/40 p-3">
              <span className="text-slate-400">TreasuryToken (STT)</span>
              <span className="text-cyan-300">{CONTRACTS.treasuryToken}</span>
            </div>
            <div className="flex flex-wrap justify-between gap-2 rounded-lg border border-slate-800 bg-slate-950/40 p-3">
              <span className="text-slate-400">TreasuryManager</span>
              <span className="text-cyan-300">{CONTRACTS.treasuryManager}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Security Controls</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              {SECURITY_CONTROLS.map((item) => (
                <div
                  key={item.control}
                  className="rounded-lg border border-slate-800 bg-slate-950/40 p-3"
                >
                  <p className="text-sm font-medium text-slate-200">{item.control}</p>
                  <p className="mt-1 text-xs text-slate-500">{item.detail}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="mt-12 text-center">
          <Button asChild>
            <Link href="/demo">Run the demo walkthrough →</Link>
          </Button>
        </div>
      </div>
    </MarketingShell>
  );
}
