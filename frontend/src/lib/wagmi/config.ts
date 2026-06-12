import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { http } from "wagmi";
import { CHAIN } from "@/config/contracts";

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "00000000000000000000000000000000";
const rpcUrl = process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL;

export const wagmiConfig = getDefaultConfig({
  appName: "Sentinel Treasury",
  projectId,
  chains: [CHAIN],
  transports: {
    [CHAIN.id]: http(rpcUrl),
  },
  ssr: true,
});
