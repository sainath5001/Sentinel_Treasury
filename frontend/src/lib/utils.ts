import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatUnits } from "viem";
import { PaymentStatus, type PaymentRequest } from "@/types/treasury";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function shortenAddress(address: string, chars = 4): string {
  return `${address.slice(0, chars + 2)}…${address.slice(-chars)}`;
}

export function formatTokenAmount(amount: bigint, decimals = 18, symbol = "STT"): string {
  const value = formatUnits(amount, decimals);
  const parsed = Number.parseFloat(value);
  return `${parsed.toLocaleString(undefined, { maximumFractionDigits: 4 })} ${symbol}`;
}

export function formatTimestamp(seconds: bigint | number): string {
  const date = new Date(Number(seconds) * 1000);
  return date.toLocaleString();
}

export function statusLabel(status: PaymentStatus): string {
  switch (status) {
    case PaymentStatus.Pending:
      return "Pending";
    case PaymentStatus.ComplianceApproved:
      return "Compliance Approved";
    case PaymentStatus.Approved:
      return "Approved";
    case PaymentStatus.Executed:
      return "Executed";
    case PaymentStatus.Rejected:
      return "Rejected";
    default:
      return "Unknown";
  }
}

export function statusVariant(
  status: PaymentStatus,
): "default" | "warning" | "success" | "destructive" | "info" {
  switch (status) {
    case PaymentStatus.Pending:
      return "warning";
    case PaymentStatus.ComplianceApproved:
      return "info";
    case PaymentStatus.Approved:
      return "info";
    case PaymentStatus.Executed:
      return "success";
    case PaymentStatus.Rejected:
      return "destructive";
    default:
      return "default";
  }
}

type RawPaymentRequestObject = {
  id: bigint;
  recipient: `0x${string}`;
  amount: bigint;
  description: string;
  status: number;
  createdAt: bigint;
  executedAt: bigint;
};

type RawPaymentRequestTuple = readonly [
  bigint,
  `0x${string}`,
  bigint,
  string,
  number,
  bigint,
  bigint,
];

export function parsePaymentRequest(raw: RawPaymentRequestObject | RawPaymentRequestTuple): PaymentRequest {
  if ("id" in raw) {
    return {
      id: raw.id,
      recipient: raw.recipient,
      amount: raw.amount,
      description: raw.description,
      status: raw.status as PaymentStatus,
      createdAt: raw.createdAt,
      executedAt: raw.executedAt,
    };
  }

  return {
    id: raw[0],
    recipient: raw[1],
    amount: raw[2],
    description: raw[3],
    status: raw[4] as PaymentStatus,
    createdAt: raw[5],
    executedAt: raw[6],
  };
}

export function explorerAddressUrl(address: string): string {
  return `https://sepolia.etherscan.io/address/${address}`;
}

export function explorerTxUrl(hash: string): string {
  return `https://sepolia.etherscan.io/tx/${hash}`;
}
