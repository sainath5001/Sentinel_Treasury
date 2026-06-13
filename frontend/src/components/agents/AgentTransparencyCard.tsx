import { AGENT_REGISTRY } from "@/config/agents";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AgentIdentityBadge } from "@/components/terminal3/AgentIdentityBadge";
import { Bot, FileCheck, Scale, ScrollText } from "lucide-react";

const AGENT_META = {
  treasury: {
    icon: Bot,
    color: "text-cyan-400",
    explanation:
      "Parses natural language into structured PaymentProposal. Resolves payee names via directory. Never executes without downstream approval.",
  },
  compliance: {
    icon: FileCheck,
    color: "text-emerald-400",
    explanation:
      "Enforces tiered policy: auto (<100 STT), approval (100–1K), escalation (>1K). Checks treasury balance and flags violations.",
  },
  approval: {
    icon: Scale,
    color: "text-violet-400",
    explanation:
      "Decides auto-approve vs human sign-off vs CFO escalation. Maps decisions to on-chain APPROVER role requirements.",
  },
  audit: {
    icon: ScrollText,
    color: "text-amber-400",
    explanation:
      "Generates SHA-256 audit hash over full pipeline metadata. Anchors agent actions for regulatory traceability.",
  },
} as const;

export function AgentTransparencyCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Agent Transparency</CardTitle>
        <CardDescription>
          Each agent has a T3 DID, scoped permissions, and explainable behavior
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {(Object.keys(AGENT_REGISTRY) as Array<keyof typeof AGENT_REGISTRY>).map((id) => {
          const agent = AGENT_REGISTRY[id];
          const meta = AGENT_META[id];
          const Icon = meta.icon;

          return (
            <div
              key={id}
              className="rounded-lg border border-slate-800 bg-slate-950/40 p-4"
            >
              <div className="flex items-start gap-3">
                <div className={`mt-0.5 ${meta.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-medium text-slate-100">{agent.displayName}</p>
                    <Badge variant="default">{agent.role}</Badge>
                  </div>
                  <div className="mt-2">
                    <AgentIdentityBadge did={agent.did} verified />
                  </div>
                  <p className="mt-2 text-xs text-slate-400 leading-relaxed">{meta.explanation}</p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {agent.allowedActions.map((action) => (
                      <Badge key={action} variant="info" className="text-[9px]">
                        {action}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
