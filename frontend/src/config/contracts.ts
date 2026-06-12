import { sepolia } from "wagmi/chains";

export const CHAIN = sepolia;

export const CONTRACTS = {
  treasuryToken: "0x80C9Cd8554B6402ffCa7D090E9a5441b853746C9" as const,
  treasuryManager: "0x9A85abB69efdB975be3b3b5195F4B9f67A5A63D6" as const,
} as const;

export const ROLE_HASHES = {
  TREASURY_ROLE: "0xe1dcbdb91df27212a29bc27177c840cf2f819ecf2187432e1fac86c2dd5dfca9" as const,
  COMPLIANCE_ROLE: "0x442a94f1a1fac79af32856af2a64f63648cfa2ef3b98610a5bb7cbec4cee6985" as const,
  APPROVER_ROLE: "0x408a36151f841709116a4e8aca4e0202874f7f54687dcb863b1ea4672dc9d8cf" as const,
  DEFAULT_ADMIN_ROLE: "0x0000000000000000000000000000000000000000000000000000000000000000" as const,
} as const;

export const EXPLORER_URL = "https://sepolia.etherscan.io";
