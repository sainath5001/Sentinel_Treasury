import Link from "next/link";
import { Bot, Shield, Vault } from "lucide-react";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { TrustStrip } from "@/components/marketing/TrustStrip";
import { PipelineDiagram } from "@/components/marketing/PipelineDiagram";
import { AetherFlowHero } from "@/components/ui/aether-flow-hero";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PLATFORM_FEATURES } from "@/content/features";

export default function LandingPage() {
  return (
    <MarketingShell>
      <AetherFlowHero />

      <section className="border-t border-slate-800/80 bg-[#070B14]">
        <div className="mx-auto max-w-6xl px-4 py-12 lg:px-8">
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { icon: Bot, label: "4 AI Agents", sub: "Orchestrated pipeline" },
              { icon: Shield, label: "T3 Protected", sub: "Identity + delegation" },
              { icon: Vault, label: "Sepolia Live", sub: "On-chain treasury" },
            ].map(({ icon: Icon, label, sub }) => (
              <Card key={label}>
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-cyan-500/20 bg-cyan-500/10">
                    <Icon className="h-5 w-5 text-cyan-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-100">{label}</p>
                    <p className="text-xs text-slate-500">{sub}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <TrustStrip />

      {/* Pipeline */}
      <section className="mx-auto max-w-6xl px-4 py-20 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-slate-50 sm:text-3xl">
            Natural language → verified agents → on-chain execution
          </h2>
          <p className="mt-3 text-slate-400">
            Every step identity-verified and delegation-authorized via Terminal 3
          </p>
        </div>
        <PipelineDiagram />
      </section>

      {/* Features preview */}
      <section className="border-t border-slate-800/80 bg-slate-950/30 py-20">
        <div className="mx-auto max-w-6xl px-4 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-10">
            <div>
              <h2 className="text-2xl font-bold text-slate-50">Built for enterprise control</h2>
              <p className="mt-2 text-slate-400">AI speed without sacrificing security or auditability</p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/features">All features →</Link>
            </Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {PLATFORM_FEATURES.slice(0, 6).map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.title}>
                  <CardContent className="p-5">
                    <div className="flex items-center gap-2">
                      <Icon className="h-5 w-5 text-cyan-400" />
                      {feature.t3 && (
                        <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[9px] text-emerald-400">
                          T3
                        </span>
                      )}
                    </div>
                    <p className="mt-3 font-medium text-slate-100">{feature.title}</p>
                    <p className="mt-2 text-sm text-slate-500 leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 py-20 lg:px-8">
        <div className="rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-cyan-500/10 via-slate-950 to-emerald-500/5 p-8 text-center lg:p-12">
          <h2 className="text-2xl font-bold text-slate-50">Ready for the judge demo?</h2>
          <p className="mx-auto mt-3 max-w-xl text-slate-400">
            15-minute walkthrough covering T3 identity, AI pipeline, on-chain execution,
            kill switch, and audit trail.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button size="lg" asChild>
              <Link href="/demo">Demo Walkthrough</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/architecture">View Architecture</Link>
            </Button>
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
