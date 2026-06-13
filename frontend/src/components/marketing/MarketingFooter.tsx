import Link from "next/link";
import { Shield } from "lucide-react";

export function MarketingFooter() {
  return (
    <footer className="border-t border-slate-800/80 bg-slate-950/50">
      <div className="mx-auto max-w-6xl px-4 py-12 lg:px-8">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-cyan-400" />
              <span className="font-semibold text-slate-100">Sentinel Treasury</span>
            </div>
            <p className="mt-3 text-sm text-slate-500 leading-relaxed">
              Enterprise autonomous treasury with verifiable AI agents and Terminal 3
              identity authorization.
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Product</p>
            <ul className="mt-3 space-y-2 text-sm text-slate-400">
              <li><Link href="/features" className="hover:text-cyan-300">Features</Link></li>
              <li><Link href="/architecture" className="hover:text-cyan-300">Architecture</Link></li>
              <li><Link href="/demo" className="hover:text-cyan-300">Demo Walkthrough</Link></li>
              <li><Link href="/dashboard" className="hover:text-cyan-300">Dashboard</Link></li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Stack</p>
            <ul className="mt-3 space-y-2 text-sm text-slate-400">
              <li>Terminal 3 · @terminal3/t3n-sdk</li>
              <li>GPT-4.1 Multi-Agent Pipeline</li>
              <li>Ethereum Sepolia · Foundry</li>
              <li>Next.js 16 · wagmi · RainbowKit</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-slate-800 pt-8 text-xs text-slate-600">
          <p>Sentinel Treasury — Hackathon Build 2026</p>
          <p>Identity → Authorization → Protected Action → Audit</p>
        </div>
      </div>
    </footer>
  );
}
