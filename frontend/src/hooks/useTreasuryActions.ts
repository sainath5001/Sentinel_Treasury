"use client";

import { useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { parseUnits } from "viem";
import { CONTRACTS } from "@/config/contracts";
import { treasuryManagerAbi } from "@/lib/contracts/abis/treasuryManager";

export function useTreasuryActions() {
  const { writeContract, data: hash, isPending, error, reset } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const createRequest = (recipient: `0x${string}`, amount: string, description: string, decimals = 18) => {
    writeContract({
      address: CONTRACTS.treasuryManager,
      abi: treasuryManagerAbi,
      functionName: "createPaymentRequest",
      args: [recipient, parseUnits(amount, decimals), description],
    });
  };

  const validateCompliance = (id: bigint) => {
    writeContract({
      address: CONTRACTS.treasuryManager,
      abi: treasuryManagerAbi,
      functionName: "validateCompliance",
      args: [id],
    });
  };

  const approveRequest = (id: bigint) => {
    writeContract({
      address: CONTRACTS.treasuryManager,
      abi: treasuryManagerAbi,
      functionName: "approveRequest",
      args: [id],
    });
  };

  const executePayment = (id: bigint) => {
    writeContract({
      address: CONTRACTS.treasuryManager,
      abi: treasuryManagerAbi,
      functionName: "executePayment",
      args: [id],
    });
  };

  const rejectRequest = (id: bigint) => {
    writeContract({
      address: CONTRACTS.treasuryManager,
      abi: treasuryManagerAbi,
      functionName: "rejectRequest",
      args: [id],
    });
  };

  return {
    createRequest,
    validateCompliance,
    approveRequest,
    executePayment,
    rejectRequest,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
    reset,
  };
}
