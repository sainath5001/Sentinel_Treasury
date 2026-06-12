import { NextResponse } from "next/server";
import { runAuditAgent } from "@/agents/auditAgent";
import { approvalDecisionSchema, complianceReportSchema, paymentProposalSchema } from "@/types/agents";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const proposal = paymentProposalSchema.safeParse(body?.proposal);
    const compliance = complianceReportSchema.safeParse(body?.compliance);
    const approval = approvalDecisionSchema.safeParse(body?.approval);

    if (!proposal.success || !compliance.success || !approval.success) {
      return NextResponse.json(
        { error: "Valid proposal, compliance, and approval data required" },
        { status: 400 },
      );
    }

    if (!body?.userMessage) {
      return NextResponse.json({ error: "userMessage is required" }, { status: 400 });
    }

    const result = await runAuditAgent({
      proposal: proposal.data,
      compliance: compliance.data,
      approval: approval.data,
      userMessage: body.userMessage,
    });

    return NextResponse.json(result);
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Audit agent failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
