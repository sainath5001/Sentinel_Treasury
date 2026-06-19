"use client";

import { Bell, Menu } from "lucide-react";
import { WalletConnectButton } from "@/components/wallet/WalletConnectButton";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  title: string;
  description?: string;
  onMenuClick?: () => void;
}

export function Header({ title, description, onMenuClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-violet-500/10 bg-black/70 px-4 backdrop-blur-md lg:px-8">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="lg:hidden" onClick={onMenuClick}>
          <Menu className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-lg font-semibold text-slate-50">{title}</h1>
          {description && <p className="text-xs text-slate-500 hidden sm:block">{description}</p>}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="hidden sm:inline-flex">
          <Bell className="h-4 w-4" />
        </Button>
        <WalletConnectButton />
      </div>
    </header>
  );
}
