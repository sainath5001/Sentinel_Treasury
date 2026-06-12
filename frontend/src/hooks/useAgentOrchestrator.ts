"use client";

import { useMutation } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import type { OrchestrateResponse } from "@/types/agents";
import { useTreasuryBalance } from "@/hooks/useTreasuryBalance";
import { formatUnits } from "viem";

export function useAgentOrchestrator() {
  const { address } = useAccount();
  const { balance, decimals, symbol } = useTreasuryBalance();

  return useMutation({
    mutationFn: async (message: string): Promise<OrchestrateResponse> => {
      const treasuryBalance = formatUnits(balance, decimals);

      const res = await fetch("/api/orchestrate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          treasuryBalance,
          tokenSymbol: symbol,
          requesterAddress: address,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Orchestration failed");
      }

      return res.json();
    },
  });
}
