import { NextResponse } from "next/server";
import { runOrchestrator } from "@/agents/orchestrator";
import { orchestrateResponseSchema } from "@/types/agents";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const message = body?.message;

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "message is required" }, { status: 400 });
    }

    const result = await runOrchestrator({
      message,
      context: {
        treasuryBalance: body.treasuryBalance,
        tokenSymbol: body.tokenSymbol,
        requesterAddress: body.requesterAddress,
      },
    });

    const validated = orchestrateResponseSchema.safeParse(result);
    if (!validated.success) {
      return NextResponse.json(
        { error: "Invalid orchestrator output", details: validated.error.flatten() },
        { status: 500 },
      );
    }

    return NextResponse.json(validated.data);
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Orchestration failed";
    console.error("[orchestrate]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
