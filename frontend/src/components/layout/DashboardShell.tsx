"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bot, ClipboardList, FileSearch, LayoutDashboard, Settings, Shield, Vault, X } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { cn } from "@/lib/utils";

const mobileNav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/agents", label: "Agents", icon: Bot },
  { href: "/treasury", label: "Treasury", icon: Vault },
  { href: "/requests", label: "Requests", icon: ClipboardList },
  { href: "/audit", label: "Audit", icon: FileSearch },
  { href: "/settings", label: "Settings", icon: Settings },
];

interface DashboardShellProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export function DashboardShell({ title, description, children }: DashboardShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-[#070B14]">
      <Sidebar />

      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-72 border-r border-slate-800 bg-slate-950 p-4">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-cyan-400" />
                <span className="font-semibold text-slate-100">Sentinel</span>
              </div>
              <button onClick={() => setMobileOpen(false)} className="text-slate-400">
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="space-y-1">
              {mobileNav.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm",
                    pathname === href ? "bg-cyan-500/10 text-cyan-300" : "text-slate-400",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <Header title={title} description={description} onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1 p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
