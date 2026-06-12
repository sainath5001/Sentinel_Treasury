"use client";

import { DashboardShell } from "@/components/layout/DashboardShell";
import { PaymentQueue } from "@/components/treasury/PaymentQueue";
import { ApprovalCenter } from "@/components/treasury/ApprovalCenter";
import { TransactionHistory } from "@/components/treasury/TransactionHistory";
import { CreatePaymentForm } from "@/components/agents/CreatePaymentForm";

export default function RequestsPage() {
  return (
    <DashboardShell
      title="Payment Requests"
      description="Full lifecycle management for outbound treasury payments"
    >
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <TransactionHistory />
          <PaymentQueue limit={10} />
        </div>
        <div className="space-y-6">
          <CreatePaymentForm />
          <ApprovalCenter />
        </div>
      </div>
    </DashboardShell>
  );
}
