"use client";

import { useAccount, useReadContracts } from "wagmi";
import { CONTRACTS, ROLE_HASHES } from "@/config/contracts";
import { treasuryManagerAbi } from "@/lib/contracts/abis/treasuryManager";

export function useUserRoles() {
  const { address, isConnected } = useAccount();

  const { data, isLoading, refetch } = useReadContracts({
    contracts: address
      ? (Object.values(ROLE_HASHES) as `0x${string}`[]).map((roleHash) => ({
          address: CONTRACTS.treasuryManager,
          abi: treasuryManagerAbi,
          functionName: "hasRole" as const,
          args: [roleHash, address] as const,
        }))
      : [],
    query: { enabled: !!address },
  });

  const roles = {
    TREASURY_ROLE: data?.[0]?.result === true,
    COMPLIANCE_ROLE: data?.[1]?.result === true,
    APPROVER_ROLE: data?.[2]?.result === true,
    DEFAULT_ADMIN_ROLE: data?.[3]?.result === true,
  };

  return { roles, isConnected, address, isLoading, refetch };
}
