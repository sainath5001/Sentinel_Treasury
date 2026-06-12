import { NextResponse } from "next/server";
import { AuthorizationService } from "@/lib/terminal3";
import type { SentinelAgentId } from "@/types/terminal3";

export const runtime = "nodejs";

const VALID_AGENTS: SentinelAgentId[] = ["treasury", "compliance", "approval", "audit"];

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const agentId = body?.agentId as SentinelAgentId;

    if (!agentId || !VALID_AGENTS.includes(agentId)) {
      return NextResponse.json({ error: "Valid agentId is required" }, { status: 400 });
    }

    const authService = new AuthorizationService();
    await authService.revokeAgent(agentId);

    return NextResponse.json({
      success: true,
      agentId,
      message: `Agent ${agentId} delegation revoked`,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Revocation failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
