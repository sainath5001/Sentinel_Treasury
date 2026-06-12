import { NextResponse } from "next/server";
import { runComplianceAgent } from "@/agents/complianceAgent";
import { paymentProposalSchema } from "@/types/agents";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const proposal = paymentProposalSchema.safeParse(body?.proposal);

    if (!proposal.success) {
      return NextResponse.json({ error: "Valid proposal is required" }, { status: 400 });
    }

    if (!body?.treasuryBalance) {
      return NextResponse.json({ error: "treasuryBalance is required" }, { status: 400 });
    }

    const result = await runComplianceAgent({
      proposal: proposal.data,
      treasuryBalance: body.treasuryBalance,
    });

    return NextResponse.json(result);
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Compliance agent failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
