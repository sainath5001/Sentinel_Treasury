import Link from "next/link";
import { Bot, Shield, Vault } from "lucide-react";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { TrustStrip } from "@/components/marketing/TrustStrip";
import { PipelineDiagram } from "@/components/marketing/PipelineDiagram";
import { PlatformFeaturesSection } from "@/components/marketing/PlatformFeaturesSection";
import { AetherFlowHero } from "@/components/ui/aether-flow-hero";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function LandingPage() {
  return (
    <MarketingShell>
      <AetherFlowHero />

      <section className="border-t border-violet-500/10 bg-black">
        <div className="mx-auto max-w-6xl px-4 py-12 lg:px-8">
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { icon: Bot, label: "4 AI Agents", sub: "Orchestrated pipeline" },
              { icon: Shield, label: "T3 Protected", sub: "Identity + delegation" },
              { icon: Vault, label: "Sepolia Live", sub: "On-chain treasury" },
            ].map(({ icon: Icon, label, sub }) => (
              <Card key={label} className="border-violet-500/15 bg-black/50">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-violet-500/30 bg-violet-500/10">
                    <Icon className="h-5 w-5 text-violet-300" />
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

      <PlatformFeaturesSection />

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
