"use client";

import { Bot, ShieldCheck, UserCheck, FileSearch } from "lucide-react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { AgentChatPanel } from "@/components/agents/AgentChatPanel";
import { CreatePaymentForm } from "@/components/agents/CreatePaymentForm";
import { AgentActivityFeed } from "@/components/agents/AgentActivityFeed";
import { ApprovalCenter } from "@/components/treasury/ApprovalCenter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const AGENTS = [
  {
    name: "Treasury Agent",
    role: "TREASURY_ROLE",
    description: "Interprets requests and creates payment proposals",
    icon: Bot,
    color: "text-cyan-400",
  },
  {
    name: "Compliance Agent",
    role: "COMPLIANCE_ROLE",
    description: "Validates policies and transaction thresholds",
    icon: ShieldCheck,
    color: "text-emerald-400",
  },
  {
    name: "Approval Agent",
    role: "APPROVER_ROLE",
    description: "Determines approval requirements and human gates",
    icon: UserCheck,
    color: "text-violet-400",
  },
  {
    name: "Audit Agent",
    role: "AUDIT",
    description: "Generates audit records and tracks all actions",
    icon: FileSearch,
    color: "text-amber-400",
  },
];

export default function AgentsPage() {
  return (
    <DashboardShell
      title="Agent Workspace"
      description="Multi-agent treasury operations with Terminal 3 identity"
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        {AGENTS.map((agent) => (
          <Card key={agent.name}>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <agent.icon className={`h-5 w-5 ${agent.color}`} />
                <CardTitle className="text-base">{agent.name}</CardTitle>
              </div>
              <CardDescription>{agent.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Badge variant="info">{agent.role}</Badge>
              <p className="mt-2 text-xs text-slate-500">did:t3n:…{agent.name.toLowerCase().replace(" ", "-")}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2 mb-6">
        <AgentChatPanel />
        <AgentActivityFeed limit={10} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <CreatePaymentForm />
      </div>

      <div className="mt-6">
        <ApprovalCenter />
      </div>
    </DashboardShell>
  );
}
