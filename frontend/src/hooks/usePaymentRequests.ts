"use client";

import { useReadContract } from "wagmi";
import { CONTRACTS } from "@/config/contracts";
import { treasuryManagerAbi } from "@/lib/contracts/abis/treasuryManager";
import { parsePaymentRequest } from "@/lib/utils";
import type { PaymentRequest } from "@/types/treasury";

export function usePaymentRequests() {
  const { data, isLoading, isError, refetch, isFetching } = useReadContract({
    address: CONTRACTS.treasuryManager,
    abi: treasuryManagerAbi,
    functionName: "getAllRequests",
    query: { refetchInterval: 12_000 },
  });

  const requests: PaymentRequest[] = data
    ? [...data].map((r) => parsePaymentRequest(r)).reverse()
    : [];

  return { requests, isLoading, isError, refetch, isFetching };
}
