"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { SentinelAgentId } from "@/types/terminal3";
import type { AgentRegistryEntry } from "@/config/agents";
import type { T3AgentIdentity, T3DelegationRecord } from "@/types/terminal3";

export interface T3StatusResponse {
  adapter: string;
  ownerDid: string;
  agents: AgentRegistryEntry[];
  identities: T3AgentIdentity[];
  delegations: T3DelegationRecord[];
  network?: {
    connected: boolean;
    ownerDid?: string;
    nodeUrl?: string;
    ethAddress?: string;
    authenticated?: boolean;
    usage?: { balance: unknown; entryCount: number } | null;
  };
}

export function useT3Status() {
  return useQuery<T3StatusResponse>({
    queryKey: ["t3-status"],
    queryFn: async () => {
      const res = await fetch("/api/t3/status");
      if (!res.ok) throw new Error("Failed to load T3 status");
      return res.json();
    },
    refetchInterval: 30_000,
  });
}

export function useRevokeAgent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (agentId: SentinelAgentId) => {
      const res = await fetch("/api/t3/revoke", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentId }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Revocation failed");
      }
      return res.json();
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["t3-status"] });
    },
  });
}
