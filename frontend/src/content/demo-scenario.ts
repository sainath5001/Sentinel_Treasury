/** Mock enterprise scenario for hackathon demos — Acme Global Treasury. */

export const ENTERPRISE_SCENARIO = {
  company: "Acme Global Treasury",
  tagline: "Multi-entity corporate treasury with AI agent delegation",
  fiscalYear: "FY2026",
  treasuryBalance: "2,450,000 STT",
  monthlyOutflow: "184,200 STT",
  activeAgents: 4,
  delegatedActions: 12,
  complianceScore: 98,
  lastAudit: "2026-06-11T14:30:00Z",
} as const;

export const DEMO_VENDORS = [
  {
    id: "v-rahul",
    name: "Rahul Consulting Ltd",
    alias: "rahul",
    category: "Professional Services",
    monthlyCap: "5,000 STT",
    ytdPaid: "12,400 STT",
    riskTier: "low" as const,
    address: "0x7099…79C8",
  },
  {
    id: "v-cloud",
    name: "CloudScale Infrastructure",
    alias: "vendor",
    category: "SaaS / Infrastructure",
    monthlyCap: "25,000 STT",
    ytdPaid: "89,200 STT",
    riskTier: "medium" as const,
    address: "0x3C44…93BC",
  },
  {
    id: "v-alice",
    name: "Alice Equipment Co.",
    alias: "alice",
    category: "Capital Expenditure",
    monthlyCap: "50,000 STT",
    ytdPaid: "31,500 STT",
    riskTier: "high" as const,
    address: "0x90F7…b906",
  },
] as const;

export const DEMO_PAYMENT_SCENARIOS = [
  {
    id: "demo-1",
    prompt: "Pay Rahul 50 STT for invoice #1042",
    narrative:
      "Routine vendor payment under auto-compliance threshold. Treasury Agent parses intent, Compliance auto-approves, Approval Agent grants auto-approve, Audit anchors hash.",
    expectedTier: "auto",
    amount: "50",
    recipient: "Rahul Consulting Ltd",
    t3Actions: ["CREATE_PAYMENT_REQUEST", "RECORD_COMPLIANCE", "EVALUATE_APPROVAL", "ANCHOR_AUDIT"],
  },
  {
    id: "demo-2",
    prompt: "Pay vendor 500 STT for Q2 cloud services",
    narrative:
      "Mid-tier payment triggers human approval workflow. Demonstrates policy boundary at 100–1000 STT and approver role gating on-chain.",
    expectedTier: "approval",
    amount: "500",
    recipient: "CloudScale Infrastructure",
    t3Actions: ["CREATE_PAYMENT_REQUEST", "RECORD_COMPLIANCE", "EVALUATE_APPROVAL", "ANCHOR_AUDIT"],
  },
  {
    id: "demo-3",
    prompt: "Send 1500 STT to Alice for equipment purchase",
    narrative:
      "High-value escalation path. Compliance flags manual review, Approval Agent escalates to human CFO sign-off before execution.",
    expectedTier: "escalation",
    amount: "1500",
    recipient: "Alice Equipment Co.",
    t3Actions: ["CREATE_PAYMENT_REQUEST", "RECORD_COMPLIANCE", "EVALUATE_APPROVAL", "ANCHOR_AUDIT"],
  },
] as const;

export const POLICY_THRESHOLDS = [
  { range: "< 100 STT", behavior: "Auto-compliant", color: "emerald" },
  { range: "100 – 1,000 STT", behavior: "Approver sign-off required", color: "amber" },
  { range: "> 1,000 STT", behavior: "Manual CFO escalation", color: "red" },
] as const;
