"use client";

import { useReadContract } from "wagmi";
import { CONTRACTS } from "@/config/contracts";
import { treasuryManagerAbi } from "@/lib/contracts/abis/treasuryManager";
import { treasuryTokenAbi } from "@/lib/contracts/abis/treasuryToken";

export function useTreasuryBalance() {
  const balance = useReadContract({
    address: CONTRACTS.treasuryManager,
    abi: treasuryManagerAbi,
    functionName: "treasuryBalance",
    query: { refetchInterval: 12_000 },
  });

  const symbol = useReadContract({
    address: CONTRACTS.treasuryToken,
    abi: treasuryTokenAbi,
    functionName: "symbol",
  });

  const decimals = useReadContract({
    address: CONTRACTS.treasuryToken,
    abi: treasuryTokenAbi,
    functionName: "decimals",
  });

  const totalSupply = useReadContract({
    address: CONTRACTS.treasuryToken,
    abi: treasuryTokenAbi,
    functionName: "totalSupply",
  });

  const tokenName = useReadContract({
    address: CONTRACTS.treasuryToken,
    abi: treasuryTokenAbi,
    functionName: "name",
  });

  return {
    balance: balance.data ?? 0n,
    symbol: symbol.data ?? "STT",
    decimals: decimals.data ?? 18,
    totalSupply: totalSupply.data ?? 0n,
    tokenName: tokenName.data ?? "Sentinel Treasury Token",
    isLoading: balance.isLoading || symbol.isLoading,
    refetch: balance.refetch,
  };
}
