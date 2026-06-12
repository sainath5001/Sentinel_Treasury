"use client";

import { useEffect } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePaymentRequests } from "@/hooks/usePaymentRequests";
import { useTreasuryBalance } from "@/hooks/useTreasuryBalance";
import { useTreasuryActions } from "@/hooks/useTreasuryActions";
import { useUserRoles } from "@/hooks/useUserRoles";
import { PaymentStatus } from "@/types/treasury";
import { formatTokenAmount, shortenAddress } from "@/lib/utils";

export function ApprovalCenter() {
  const { requests, refetch } = usePaymentRequests();
  const { decimals, symbol } = useTreasuryBalance();
  const { roles } = useUserRoles();
  const { approveRequest, rejectRequest, validateCompliance, executePayment, isPending, isSuccess } =
    useTreasuryActions();

  useEffect(() => {
    if (isSuccess) void refetch();
  }, [isSuccess, refetch]);

  const pendingCompliance = requests.filter((r) => r.status === PaymentStatus.Pending);
  const pendingApproval = requests.filter((r) => r.status === PaymentStatus.ComplianceApproved);
  const readyToExecute = requests.filter((r) => r.status === PaymentStatus.Approved);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Approval Center</CardTitle>
        <CardDescription>Role-gated actions for compliance, approval, and execution</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Section title="Pending Compliance" count={pendingCompliance.length}>
          {pendingCompliance.map((req) => (
            <ActionRow
              key={req.id.toString()}
              id={req.id}
              description={req.description}
              amount={formatTokenAmount(req.amount, decimals, symbol)}
              recipient={shortenAddress(req.recipient)}
              actions={
                roles.COMPLIANCE_ROLE ? (
                  <>
                    <Button
                      size="sm"
                      variant="success"
                      disabled={isPending}
                      onClick={() => validateCompliance(req.id)}
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" /> Validate
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      disabled={isPending}
                      onClick={() => rejectRequest(req.id)}
                    >
                      <XCircle className="h-3.5 w-3.5" /> Reject
                    </Button>
                  </>
                ) : (
                  <Badge variant="warning">Awaiting Compliance Agent</Badge>
                )
              }
            />
          ))}
        </Section>

        <Section title="Awaiting Human Approval" count={pendingApproval.length}>
          {pendingApproval.map((req) => (
            <ActionRow
              key={req.id.toString()}
              id={req.id}
              description={req.description}
              amount={formatTokenAmount(req.amount, decimals, symbol)}
              recipient={shortenAddress(req.recipient)}
              actions={
                roles.APPROVER_ROLE ? (
                  <>
                    <Button
                      size="sm"
                      variant="success"
                      disabled={isPending}
                      onClick={() => approveRequest(req.id)}
                    >
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      disabled={isPending}
                      onClick={() => rejectRequest(req.id)}
                    >
                      Reject
                    </Button>
                  </>
                ) : (
                  <Badge variant="info">Awaiting Approver</Badge>
                )
              }
            />
          ))}
        </Section>

        <Section title="Ready to Execute" count={readyToExecute.length}>
          {readyToExecute.map((req) => (
            <ActionRow
              key={req.id.toString()}
              id={req.id}
              description={req.description}
              amount={formatTokenAmount(req.amount, decimals, symbol)}
              recipient={shortenAddress(req.recipient)}
              actions={
                roles.TREASURY_ROLE ? (
                  <Button
                    size="sm"
                    disabled={isPending}
                    onClick={() => executePayment(req.id)}
                  >
                    Execute Payment
                  </Button>
                ) : (
                  <Badge variant="info">Awaiting Treasury Agent</Badge>
                )
              }
            />
          ))}
        </Section>

        {pendingCompliance.length === 0 && pendingApproval.length === 0 && readyToExecute.length === 0 && (
          <p className="text-center text-sm text-slate-500 py-6">No actions required</p>
        )}
      </CardContent>
    </Card>
  );
}

function Section({ title, count, children }: { title: string; count: number; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <h4 className="text-sm font-medium text-slate-300">{title}</h4>
        <Badge variant="default">{count}</Badge>
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function ActionRow({
  id,
  description,
  amount,
  recipient,
  actions,
}: {
  id: bigint;
  description: string;
  amount: string;
  recipient: string;
  actions: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-slate-800 bg-slate-950/40 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm font-medium text-slate-200">
          #{id.toString()} · {amount}
        </p>
        <p className="text-sm text-slate-400">{description}</p>
        <p className="text-xs text-slate-500 mt-1">To {recipient}</p>
      </div>
      <div className="flex flex-wrap gap-2">{actions}</div>
    </div>
  );
}
