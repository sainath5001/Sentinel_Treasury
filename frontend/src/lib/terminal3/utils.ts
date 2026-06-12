import { createHash } from "crypto";
import type { T3Action } from "@/types/terminal3";
import { generateNonce } from "@/lib/terminal3/adapters/LocalT3Adapter";

export function hashPayload(payload: unknown): `0x${string}` {
  const canonical =
    payload !== null && typeof payload === "object" && !Array.isArray(payload)
      ? JSON.stringify(payload, Object.keys(payload as object).sort())
      : JSON.stringify(payload);
  return `0x${createHash("sha256").update(canonical).digest("hex")}`;
}

export function createActionId(): string {
  return `t3act_${Date.now()}_${generateNonce().slice(0, 8)}`;
}

export function actionForAgentStep(step: string): T3Action {
  switch (step) {
    case "treasury":
      return "CREATE_PAYMENT_REQUEST";
    case "compliance":
      return "RECORD_COMPLIANCE";
    case "approval":
      return "EVALUATE_APPROVAL";
    case "audit":
      return "ANCHOR_AUDIT";
    default:
      return "READ_TREASURY_STATE";
  }
}
