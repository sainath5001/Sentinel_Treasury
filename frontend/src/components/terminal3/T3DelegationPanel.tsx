"use client";

import { Loader2, ShieldOff, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AgentIdentityBadge } from "@/components/terminal3/AgentIdentityBadge";
import { useT3Status, useRevokeAgent } from "@/hooks/useT3Status";
import type { SentinelAgentId } from "@/types/terminal3";

export function T3DelegationPanel() {
  const { data, isLoading, error } = useT3Status();
  const revoke = useRevokeAgent();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-cyan-400" />
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-sm text-red-400">
          Failed to load Terminal 3 status
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Terminal 3 Delegations</CardTitle>
        <CardDescription>
          Agent identity, authorization, and delegation status · Adapter: {data.adapter}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg border border-slate-800 bg-slate-950/40 p-3">
          <p className="text-xs text-slate-500">Owner DID</p>
          <p className="mt-1 font-mono text-sm text-cyan-300">{data.ownerDid}</p>
        </div>

        {data.delegations.map((delegation) => {
          const agent = data.agents.find((a) => a.did === delegation.agentDid);
          const identity = data.identities.find((i) => i.did === delegation.agentDid);
          const agentId = agent?.agentId as SentinelAgentId | undefined;

          return (
            <div
              key={delegation.agentDid}
              className="rounded-lg border border-slate-800 bg-slate-950/40 p-4 space-y-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-medium text-slate-200">
                    {agent?.displayName ?? delegation.agentDid}
                  </p>
                  <AgentIdentityBadge did={delegation.agentDid} verified={delegation.active} />
                </div>
                <Badge variant={delegation.active ? "success" : "destructive"}>
                  {delegation.active ? "Delegated" : "Revoked"}
                </Badge>
              </div>

              <div className="flex flex-wrap gap-1">
                {delegation.allowedActions.map((action) => (
                  <Badge key={action} variant="default" className="text-[10px]">
                    {action}
                  </Badge>
                ))}
              </div>

              {identity && (
                <p className="text-xs text-slate-500">
                  Registered {new Date(identity.registeredAt).toLocaleDateString()} ·{" "}
                  {identity.agentUri}
                </p>
              )}

              {delegation.active && agentId && (
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={revoke.isPending}
                  onClick={() => revoke.mutate(agentId)}
                >
                  {revoke.isPending ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <ShieldOff className="h-3.5 w-3.5" />
                  )}
                  Revoke Agent
                </Button>
              )}

              {!delegation.active && (
                <p className="flex items-center gap-1 text-xs text-amber-400">
                  <ShieldOff className="h-3.5 w-3.5" />
                  Kill switch active — agent cannot execute protected actions
                </p>
              )}
            </div>
          );
        })}

        <div className="flex items-center gap-2 text-xs text-emerald-400">
          <ShieldCheck className="h-4 w-4" />
          All payment actions verify identity → authorization → protected action → audit
        </div>
      </CardContent>
    </Card>
  );
}
