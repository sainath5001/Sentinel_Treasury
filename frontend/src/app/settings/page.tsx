"use client";

import { DashboardShell } from "@/components/layout/DashboardShell";
import { useUserRoles } from "@/hooks/useUserRoles";
import { CONTRACTS, CHAIN } from "@/config/contracts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { shortenAddress } from "@/lib/utils";

export default function SettingsPage() {
  const { address, isConnected, roles } = useUserRoles();

  const roleEntries = [
    { name: "Treasury Role", key: "TREASURY_ROLE" as const, description: "Create and execute payments" },
    { name: "Compliance Role", key: "COMPLIANCE_ROLE" as const, description: "Validate payment requests" },
    { name: "Approver Role", key: "APPROVER_ROLE" as const, description: "Grant human approval" },
    { name: "Admin Role", key: "DEFAULT_ADMIN_ROLE" as const, description: "Manage roles and configuration" },
  ];

  return (
    <DashboardShell title="Settings" description="Wallet, roles, and platform configuration">
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Wallet & Network</CardTitle>
            <CardDescription>Connected account and chain configuration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <SettingRow label="Status" value={isConnected ? "Connected" : "Disconnected"} />
            <SettingRow label="Address" value={address ? shortenAddress(address, 6) : "—"} />
            <SettingRow label="Network" value={CHAIN.name} />
            <SettingRow label="Chain ID" value={CHAIN.id.toString()} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your Roles</CardTitle>
            <CardDescription>On-chain AccessControl permissions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {!isConnected ? (
              <p className="text-sm text-slate-500">Connect wallet to view roles</p>
            ) : (
              roleEntries.map((role) => (
                <div
                  key={role.key}
                  className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950/40 px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-200">{role.name}</p>
                    <p className="text-xs text-slate-500">{role.description}</p>
                  </div>
                  <Badge variant={roles[role.key] ? "success" : "default"}>
                    {roles[role.key] ? "Granted" : "None"}
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Contract Configuration</CardTitle>
            <CardDescription>Deployed Sepolia contract addresses</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <SettingRow label="Treasury Token" value={shortenAddress(CONTRACTS.treasuryToken, 6)} mono />
            <SettingRow label="Treasury Manager" value={shortenAddress(CONTRACTS.treasuryManager, 6)} mono />
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}

function SettingRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-slate-500">{label}</span>
      <span className={`text-sm text-slate-200 ${mono ? "font-mono" : ""}`}>{value}</span>
    </div>
  );
}
