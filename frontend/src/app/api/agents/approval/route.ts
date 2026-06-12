import { NextResponse } from "next/server";
import { runApprovalAgent } from "@/agents/approvalAgent";
import { complianceReportSchema, paymentProposalSchema } from "@/types/agents";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const proposal = paymentProposalSchema.safeParse(body?.proposal);
    const compliance = complianceReportSchema.safeParse(body?.compliance);

    if (!proposal.success || !compliance.success) {
      return NextResponse.json({ error: "Valid proposal and compliance report required" }, { status: 400 });
    }

    const result = await runApprovalAgent({
      proposal: proposal.data,
      compliance: compliance.data,
    });

    return NextResponse.json(result);
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Approval agent failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
