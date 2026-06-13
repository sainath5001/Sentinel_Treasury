"use client";

import Link from "next/link";
import { Fingerprint, Loader2, Shield, Wifi, WifiOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useT3Status } from "@/hooks/useT3Status";

export function T3TrustBanner() {
  const { data, isLoading } = useT3Status();

  if (isLoading) {
    return (
      <div className="mb-6 flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-950/50 px-4 py-3">
        <Loader2 className="h-4 w-4 animate-spin text-cyan-400" />
        <span className="text-sm text-slate-400">Connecting to Terminal 3…</span>
      </div>
    );
  }

  const connected = data?.network?.connected === true;
  const isRemote = data?.adapter?.includes("Remote");

  return (
    <div className="mb-6 rounded-xl border border-cyan-500/20 bg-gradient-to-r from-cyan-500/5 via-slate-950/50 to-emerald-500/5 p-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-cyan-500/30 bg-cyan-500/10">
            <Shield className="h-5 w-5 text-cyan-400" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-medium text-slate-100">Terminal 3 Trust Layer</p>
              <Badge variant={connected ? "success" : "warning"}>
                {connected ? (
                  <><Wifi className="mr-1 h-3 w-3" /> Connected</>
                ) : (
                  <><WifiOff className="mr-1 h-3 w-3" /> Local Mode</>
                )}
              </Badge>
              {isRemote && <Badge variant="info">Live SDK</Badge>}
            </div>
            <p className="mt-1 text-xs text-slate-400">
              {data?.delegations.filter((d) => d.active).length ?? 0} active delegations ·{" "}
              Adapter: {data?.adapter ?? "—"}
            </p>
            {data?.ownerDid && (
              <p className="mt-1 flex items-center gap-1 font-mono text-[10px] text-cyan-400/80">
                <Fingerprint className="h-3 w-3" />
                {data.ownerDid.length > 42 ? `${data.ownerDid.slice(0, 24)}…` : data.ownerDid}
              </p>
            )}
          </div>
        </div>

        <Button variant="outline" size="sm" asChild>
          <Link href="/settings">Manage T3 Delegations</Link>
        </Button>
      </div>
    </div>
  );
}
