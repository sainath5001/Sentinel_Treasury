import { NextResponse } from "next/server";
import { runTreasuryAgent } from "@/agents/treasuryAgent";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body?.message) {
      return NextResponse.json({ error: "message is required" }, { status: 400 });
    }

    const result = await runTreasuryAgent({
      message: body.message,
      context: body.context,
    });

    return NextResponse.json(result);
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Treasury agent failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
