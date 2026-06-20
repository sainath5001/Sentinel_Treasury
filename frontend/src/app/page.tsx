import { MarketingShell } from "@/components/marketing/MarketingShell";
import { AgentPipelineSection } from "@/components/marketing/AgentPipelineSection";
import { PlatformFeaturesSection } from "@/components/marketing/PlatformFeaturesSection";
import { DemoDisperseSection } from "@/components/marketing/DemoDisperseSection";
import { AetherFlowHero } from "@/components/ui/aether-flow-hero";

export default function LandingPage() {
  return (
    <MarketingShell>
      <AetherFlowHero />
      <AgentPipelineSection />
      <PlatformFeaturesSection />
      <DemoDisperseSection />
    </MarketingShell>
  );
}
