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
    <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r border-violet-500/10 bg-black/70 backdrop-blur-md">
      <div className="flex h-16 items-center gap-3 border-b border-violet-500/10 px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-violet-500/30 bg-violet-500/10">
          <Shield className="h-5 w-5 text-violet-300" />
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
                  ? "border border-violet-500/20 bg-violet-500/10 text-violet-300"
                  : "text-slate-400 hover:bg-violet-500/10 hover:text-violet-200",
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-3 border-t border-violet-500/10 p-4">
        <div className="rounded-lg border border-violet-500/20 bg-violet-500/5 p-3">
          <p className="text-xs font-medium text-violet-300">Terminal 3</p>
          <p className="mt-1 text-[10px] leading-relaxed text-slate-400">
            Identity → Authorization → Protected Action → Audit
          </p>
        </div>
        <div className="rounded-lg border border-violet-500/15 bg-black/50 p-3">
          <p className="text-xs font-medium text-slate-400">Network</p>
          <p className="mt-1 text-sm text-slate-200">Ethereum Sepolia</p>
          <p className="mt-2 text-xs text-violet-300">● Contracts verified</p>
        </div>
      </div>
    </aside>
  );
}
