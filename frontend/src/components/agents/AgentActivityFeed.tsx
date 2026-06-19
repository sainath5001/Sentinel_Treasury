"use client";

import { Bot, CheckCircle2, Clock, ShieldCheck, UserCheck } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { usePaymentRequests } from "@/hooks/usePaymentRequests";
import { PaymentStatus } from "@/types/treasury";
import type { AgentActivity } from "@/types/treasury";

const AGENT_MAP: Record<string, string> = {
  requested: "Treasury Agent",
  compliance: "Compliance Agent",
  approval: "Approval Agent",
  execution: "Treasury Agent",
  rejection: "Audit Agent",
};

export function AgentActivityFeed({ limit = 8 }: { limit?: number }) {
  const { requests } = usePaymentRequests();

  const activities: AgentActivity[] = requests.flatMap((req) => {
    const items: AgentActivity[] = [
      {
        id: `${req.id}-created`,
        agent: AGENT_MAP.requested,
        action: `Created payment request: ${req.description}`,
        timestamp: new Date(Number(req.createdAt) * 1000),
        status: "success",
        requestId: req.id.toString(),
      },
    ];

    if (req.status >= PaymentStatus.ComplianceApproved) {
      items.push({
        id: `${req.id}-compliance`,
        agent: AGENT_MAP.compliance,
        action: `Compliance validated request #${req.id}`,
        timestamp: new Date(Number(req.createdAt) * 1000 + 60_000),
        status: "success",
        requestId: req.id.toString(),
      });
    }

    if (req.status >= PaymentStatus.Approved) {
      items.push({
        id: `${req.id}-approval`,
        agent: AGENT_MAP.approval,
        action: `Human approval granted for #${req.id}`,
        timestamp: new Date(Number(req.createdAt) * 1000 + 120_000),
        status: "success",
        requestId: req.id.toString(),
      });
    }

    if (req.status === PaymentStatus.Executed) {
      items.push({
        id: `${req.id}-executed`,
        agent: AGENT_MAP.execution,
        action: `Payment executed for #${req.id}`,
        timestamp: new Date(Number(req.executedAt) * 1000),
        status: "success",
        requestId: req.id.toString(),
      });
    }

    if (req.status === PaymentStatus.Rejected) {
      items.push({
        id: `${req.id}-rejected`,
        agent: AGENT_MAP.rejection,
        action: `Request #${req.id} rejected`,
        timestamp: new Date(Number(req.createdAt) * 1000 + 90_000),
        status: "failed",
        requestId: req.id.toString(),
      });
    }

    if (req.status === PaymentStatus.Pending) {
      items.push({
        id: `${req.id}-pending`,
        agent: AGENT_MAP.compliance,
        action: `Awaiting compliance review for #${req.id}`,
        timestamp: new Date(),
        status: "pending",
        requestId: req.id.toString(),
      });
    }

    return items;
  });

  const sorted = activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, limit);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Agent Activity Feed</CardTitle>
        <CardDescription>Multi-agent pipeline events derived from on-chain state</CardDescription>
      </CardHeader>
      <CardContent>
        {sorted.length === 0 ? (
          <p className="text-sm text-slate-500 py-6 text-center">No agent activity yet</p>
        ) : (
          <div className="space-y-4">
            {sorted.map((activity) => (
              <div key={activity.id} className="flex gap-3">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-violet-500/20 bg-black/50">
                  <AgentIcon agent={activity.agent} status={activity.status} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium text-slate-200">{activity.agent}</span>
                    <StatusBadge status={activity.status} />
                  </div>
                  <p className="mt-0.5 text-sm text-slate-400">{activity.action}</p>
                  <p className="mt-1 text-xs text-slate-500">{activity.timestamp.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function AgentIcon({ agent, status }: { agent: string; status: AgentActivity["status"] }) {
  if (status === "pending") return <Clock className="h-4 w-4 text-amber-400" />;
  if (agent.includes("Compliance")) return <ShieldCheck className="h-4 w-4 text-violet-300" />;
  if (agent.includes("Approval")) return <UserCheck className="h-4 w-4 text-violet-400" />;
  if (status === "failed") return <Bot className="h-4 w-4 text-red-400" />;
  return <CheckCircle2 className="h-4 w-4 text-emerald-400" />;
}

function StatusBadge({ status }: { status: AgentActivity["status"] }) {
  const variant = status === "success" ? "success" : status === "pending" ? "warning" : "destructive";
  return <Badge variant={variant}>{status}</Badge>;
}
