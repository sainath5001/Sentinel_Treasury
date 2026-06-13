import Link from "next/link";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { WalkthroughSteps } from "@/components/demo/WalkthroughSteps";
import { PitchDeckViewer } from "@/components/demo/PitchDeckViewer";
import { JudgingChecklist } from "@/components/demo/JudgingChecklist";
import { EnterpriseScenarioCard } from "@/components/demo/EnterpriseScenarioCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DEMO_SCRIPT_INTRO } from "@/content/walkthrough";

export default function DemoPage() {
  return (
    <MarketingShell>
      <div className="mx-auto max-w-6xl px-4 py-16 lg:px-8">
        <div className="max-w-3xl">
          <Badge variant="success" className="mb-4">Hackathon Demo Kit</Badge>
          <h1 className="text-3xl font-bold text-slate-50 sm:text-4xl">
            Demo walkthrough & judging playbook
          </h1>
          <p className="mt-4 text-slate-400 leading-relaxed">{DEMO_SCRIPT_INTRO}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/agents">Launch Agent Workspace</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/dashboard">Open Dashboard</Link>
            </Button>
          </div>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-2">
          <div>
            <h2 className="mb-4 text-xl font-bold text-slate-50">7-Step Walkthrough</h2>
            <WalkthroughSteps />
          </div>
          <div className="space-y-8">
            <PitchDeckViewer />
            <JudgingChecklist />
          </div>
        </div>

        <div className="mt-12">
          <h2 className="mb-6 text-xl font-bold text-slate-50">Enterprise Scenario — Acme Global</h2>
          <EnterpriseScenarioCard />
        </div>
      </div>
    </MarketingShell>
  );
}
