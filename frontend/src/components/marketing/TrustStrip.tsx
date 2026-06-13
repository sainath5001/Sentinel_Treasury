import { Fingerprint, Lock, Shield, ShieldCheck } from "lucide-react";

const items = [
  { icon: Fingerprint, label: "T3 Agent DIDs" },
  { icon: Shield, label: "Delegation Auth" },
  { icon: Lock, label: "Protected Actions" },
  { icon: ShieldCheck, label: "On-Chain Audit" },
];

export function TrustStrip() {
  return (
    <div className="border-y border-slate-800/80 bg-slate-950/40">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-6 px-4 py-4 lg:gap-12 lg:px-8">
        {items.map(({ icon: Icon, label }) => (
          <div key={label} className="flex items-center gap-2 text-sm text-slate-400">
            <Icon className="h-4 w-4 text-cyan-400" />
            <span>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
