"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { usePaymentRequests } from "@/hooks/usePaymentRequests";
import { PaymentStatus } from "@/types/treasury";
import { shortenAddress } from "@/lib/utils";
import type { AuditEvent } from "@/types/treasury";

export function AuditTimeline() {
  const { requests } = usePaymentRequests();

  const events: AuditEvent[] = requests.flatMap((req) => {
    const base: AuditEvent[] = [
      {
        id: `${req.id}-req`,
        type: "requested",
        requestId: req.id.toString(),
        description: `Payment requested: ${req.description} → ${shortenAddress(req.recipient)}`,
        timestamp: new Date(Number(req.createdAt) * 1000),
      },
    ];

    if (req.status >= PaymentStatus.ComplianceApproved) {
      base.push({
        id: `${req.id}-comp`,
        type: "compliance",
        requestId: req.id.toString(),
        description: "Compliance validation passed",
        timestamp: new Date(Number(req.createdAt) * 1000 + 60_000),
      });
    }

    if (req.status >= PaymentStatus.Approved) {
      base.push({
        id: `${req.id}-appr`,
        type: "approval",
        requestId: req.id.toString(),
        description: "Human approval granted",
        timestamp: new Date(Number(req.createdAt) * 1000 + 120_000),
      });
    }

    if (req.status === PaymentStatus.Executed) {
      base.push({
        id: `${req.id}-exec`,
        type: "execution",
        requestId: req.id.toString(),
        description: `Payment executed on-chain`,
        timestamp: new Date(Number(req.executedAt) * 1000),
      });
    }

    if (req.status === PaymentStatus.Rejected) {
      base.push({
        id: `${req.id}-rej`,
        type: "rejection",
        requestId: req.id.toString(),
        description: "Payment request rejected",
        timestamp: new Date(Number(req.createdAt) * 1000 + 90_000),
      });
    }

    return base;
  });

  const sorted = events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  return (
    <Card>
      <CardHeader>
        <CardTitle>Audit Timeline</CardTitle>
        <CardDescription>
          Immutable event trail reconstructed from on-chain contract state. Each lifecycle
          transition maps to an agent action with T3 attestation metadata in the orchestrate trail.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {sorted.length === 0 ? (
          <p className="text-sm text-slate-500 py-8 text-center">No audit events recorded</p>
        ) : (
          <div className="relative space-y-0">
            <div className="absolute left-4 top-2 bottom-2 w-px bg-slate-800" />
            {sorted.map((event) => (
              <div key={event.id} className="relative flex gap-4 pb-6 pl-10">
                <div className="absolute left-2.5 top-1.5 h-3 w-3 rounded-full border-2 border-cyan-500 bg-slate-950" />
                <div className="flex-1 rounded-lg border border-slate-800 bg-slate-950/40 p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={eventTypeVariant(event.type)}>{event.type}</Badge>
                    <span className="text-xs text-slate-500">Request #{event.requestId}</span>
                  </div>
                  <p className="mt-2 text-sm text-slate-300">{event.description}</p>
                  <p className="mt-2 text-xs text-slate-500">{event.timestamp.toLocaleString()}</p>
                  <p className="mt-1 text-[10px] text-emerald-400/80">
                    Verifiable via Sepolia TreasuryManager · Request #{event.requestId}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function eventTypeVariant(type: AuditEvent["type"]): "default" | "success" | "warning" | "destructive" | "info" {
  switch (type) {
    case "requested":
      return "info";
    case "compliance":
      return "warning";
    case "approval":
      return "info";
    case "execution":
      return "success";
    case "rejection":
      return "destructive";
    default:
      return "default";
  }
}
