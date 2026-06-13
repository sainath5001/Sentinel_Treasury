"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bot,
  ClipboardList,
  FileSearch,
  LayoutDashboard,
  Play,
  Settings,
  Shield,
  Vault,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/agents", label: "Agent Workspace", icon: Bot },
  { href: "/treasury", label: "Treasury Overview", icon: Vault },
  { href: "/requests", label: "Payment Requests", icon: ClipboardList },
  { href: "/audit", label: "Audit Center", icon: FileSearch },
  { href: "/demo", label: "Demo Kit", icon: Play, external: false },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r border-slate-800/80 bg-slate-950/50">
      <div className="flex h-16 items-center gap-3 border-b border-slate-800/80 px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-500/10 border border-cyan-500/30">
          <Shield className="h-5 w-5 text-cyan-400" />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-50">Sentinel Treasury</p>
          <p className="text-xs text-slate-500">Enterprise Control</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-cyan-500/10 text-cyan-300 border border-cyan-500/20"
                  : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-100",
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-800/80 p-4 space-y-3">
        <div className="rounded-lg border border-cyan-500/20 bg-cyan-500/5 p-3">
          <p className="text-xs font-medium text-cyan-400">Terminal 3</p>
          <p className="mt-1 text-[10px] text-slate-400 leading-relaxed">
            Identity → Authorization → Protected Action → Audit
          </p>
        </div>
        <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-3">
          <p className="text-xs font-medium text-slate-400">Network</p>
          <p className="mt-1 text-sm text-slate-200">Ethereum Sepolia</p>
          <p className="mt-2 text-xs text-emerald-400">● Contracts verified</p>
        </div>
      </div>
    </aside>
  );
}
