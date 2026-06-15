"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bot,
  FileSearch,
  LayoutDashboard,
  Menu,
  Shield,
  Sparkles,
  Vault,
  X,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";

const productLinks = [
  {
    title: "Features",
    href: "/features",
    description: "Multi-agent AI pipeline, T3 identity, and tiered compliance controls.",
  },
  {
    title: "Architecture",
    href: "/architecture",
    description: "Four-layer stack from presentation to Sepolia smart contracts.",
  },
  {
    title: "Demo Walkthrough",
    href: "/demo",
    description: "7-step judge script, pitch deck, and enterprise scenario.",
  },
];

const appLinks = [
  {
    title: "Dashboard",
    href: "/dashboard",
    description: "Real-time treasury operations and agent oversight.",
    icon: LayoutDashboard,
  },
  {
    title: "Agent Workspace",
    href: "/agents",
    description: "Natural language → T3-protected 4-agent pipeline.",
    icon: Bot,
  },
  {
    title: "Treasury Overview",
    href: "/treasury",
    description: "Vault balance, contracts, and transaction history.",
    icon: Vault,
  },
  {
    title: "Audit Center",
    href: "/audit",
    description: "Immutable audit trail and agent activity feed.",
    icon: FileSearch,
  },
];

function ListItem({
  title,
  children,
  href,
  ...props
}: React.ComponentPropsWithoutRef<"li"> & { href: string; title: string }) {
  return (
    <li {...props}>
      <NavigationMenuLink asChild>
        <Link
          href={href}
          className="block select-none rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-violet-500/10 hover:text-violet-200 focus:bg-violet-500/10"
        >
          <div className="text-sm font-medium leading-none text-slate-100">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-slate-500 mt-1.5">{children}</p>
        </Link>
      </NavigationMenuLink>
    </li>
  );
}

export function MarketingNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-violet-500/10 bg-black/70 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 lg:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-violet-500/30 bg-violet-500/10">
            <Shield className="h-5 w-5 text-violet-300" />
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-slate-50">Sentinel Treasury</p>
            <p className="text-[10px] text-slate-500">Powered by Terminal 3</p>
          </div>
        </Link>

        <NavigationMenu viewport={false} className="hidden lg:flex">
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Home</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid gap-2 p-2 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                  <li className="row-span-3">
                    <NavigationMenuLink asChild>
                      <Link
                        className="flex h-full w-full flex-col justify-end rounded-md border border-violet-500/20 bg-gradient-to-b from-violet-500/10 to-black/80 p-6 no-underline outline-none select-none transition-colors hover:border-violet-500/40"
                        href="/"
                      >
                        <Shield className="h-8 w-8 text-violet-300 mb-3" />
                        <div className="mb-2 text-lg font-medium text-slate-100">
                          Sentinel Treasury
                        </div>
                        <p className="text-sm leading-tight text-slate-400">
                          Enterprise autonomous treasury with verifiable AI agents and Terminal 3
                          authorization.
                        </p>
                      </Link>
                    </NavigationMenuLink>
                  </li>
                  <ListItem href="/features" title="Features">
                    AI agents, T3 identity, and on-chain execution.
                  </ListItem>
                  <ListItem href="/architecture" title="Architecture">
                    System design, data flows, and security controls.
                  </ListItem>
                  <ListItem href="/demo" title="Demo Kit">
                    Hackathon walkthrough and judging checklist.
                  </ListItem>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuTrigger>Product</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-[400px] gap-2 p-2 md:w-[500px] md:grid-cols-2">
                  {productLinks.map((item) => (
                    <ListItem key={item.href} title={item.title} href={item.href}>
                      {item.description}
                    </ListItem>
                  ))}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuTrigger>App</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-[320px] gap-1 p-2">
                  {appLinks.map(({ title, href, description, icon: Icon }) => (
                    <li key={href}>
                      <NavigationMenuLink asChild>
                        <Link
                          href={href}
                          className="flex items-start gap-3 rounded-md p-3 transition-colors hover:bg-violet-500/10"
                        >
                          <Icon className="mt-0.5 h-4 w-4 shrink-0 text-violet-300" />
                          <div>
                            <div className="text-sm font-medium text-slate-100">{title}</div>
                            <p className="text-xs text-slate-500 mt-0.5">{description}</p>
                          </div>
                        </Link>
                      </NavigationMenuLink>
                    </li>
                  ))}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link
                  href="/demo"
                  className={cn(
                    navigationMenuTriggerStyle(),
                    pathname === "/demo" && "bg-violet-500/10 text-violet-300",
                  )}
                >
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5" />
                    Demo
                  </span>
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        <div className="hidden items-center gap-2 lg:flex">
          <Button
            variant="outline"
            size="sm"
            asChild
            className="border-slate-600 bg-black/50 text-slate-100 backdrop-blur-sm hover:bg-slate-900"
          >
            <Link href="/dashboard">Open Dashboard</Link>
          </Button>
          <Button
            size="sm"
            asChild
            className="border-0 bg-[#BF80FF] text-slate-950 shadow-md shadow-violet-500/20 hover:bg-[#C896FF]"
          >
            <Link href="/demo">Start Live Demo</Link>
          </Button>
        </div>

        <button
          type="button"
          className="text-violet-300/80 lg:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-violet-500/10 bg-black/90 px-4 py-4 backdrop-blur-md lg:hidden">
          <nav className="space-y-1">
            <p className="px-3 py-1 text-[10px] uppercase tracking-wider text-slate-600">Product</p>
            {productLinks.map(({ href, title }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={cn(
                  "block rounded-lg px-3 py-2 text-sm",
                  pathname === href ? "bg-violet-500/10 text-violet-300" : "text-slate-300",
                )}
              >
                {title}
              </Link>
            ))}
            <p className="px-3 pt-3 py-1 text-[10px] uppercase tracking-wider text-slate-600">App</p>
            {appLinks.map(({ href, title }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className="block rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-violet-500/10 hover:text-violet-200"
              >
                {title}
              </Link>
            ))}
            <div className="mt-3 flex flex-col gap-2 px-3 pt-2">
              <Button
                size="sm"
                asChild
                className="w-full border-0 bg-[#BF80FF] text-slate-950 hover:bg-[#C896FF]"
              >
                <Link href="/demo" onClick={() => setOpen(false)}>
                  Start Live Demo
                </Link>
              </Button>
              <Button
                variant="outline"
                size="sm"
                asChild
                className="w-full border-slate-600 bg-black/50 text-slate-100 hover:bg-slate-900"
              >
                <Link href="/dashboard" onClick={() => setOpen(false)}>
                  Open Dashboard
                </Link>
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
