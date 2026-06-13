import Link from "next/link";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { ProtectedActionFlow } from "@/components/terminal3/ProtectedActionFlow";
import { SecurityPosturePanel } from "@/components/security/SecurityPosturePanel";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PLATFORM_FEATURES } from "@/content/features";

export default function FeaturesPage() {
  return (
    <MarketingShell>
      <div className="mx-auto max-w-6xl px-4 py-16 lg:px-8">
        <div className="max-w-2xl">
          <Badge variant="info" className="mb-4">Platform Features</Badge>
          <h1 className="text-3xl font-bold text-slate-50 sm:text-4xl">
            Everything an enterprise CTO expects from autonomous treasury
          </h1>
          <p className="mt-4 text-slate-400 leading-relaxed">
            Sentinel Treasury is not a chatbot wrapper — it is a full control plane with
            AI agents, Terminal 3 authorization, tiered compliance, and on-chain execution.
          </p>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2">
          {PLATFORM_FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card key={feature.title}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-cyan-500/20 bg-cyan-500/10">
                      <Icon className="h-5 w-5 text-cyan-400" />
                    </div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-slate-100">{feature.title}</h3>
                      {feature.t3 && <Badge variant="success">T3</Badge>}
                    </div>
                  </div>
                  <p className="mt-4 text-sm text-slate-400 leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          <ProtectedActionFlow />
          <SecurityPosturePanel />
        </div>

        <div className="mt-12 text-center">
          <Button size="lg" asChild>
            <Link href="/demo">See it in action →</Link>
          </Button>
        </div>
      </div>
    </MarketingShell>
  );
}
