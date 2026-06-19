"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { TextDisperse } from "@/components/ui/text-disperse";
import { Button } from "@/components/ui/button";

export function DemoDisperseSection() {
  return (
    <section className="relative overflow-hidden border-t border-violet-500/10 bg-black py-24 md:py-32">
      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute top-1/2 left-1/2 size-[min(100vw,720px)] -translate-x-1/2 -translate-y-1/2 rounded-full",
          "bg-[radial-gradient(ellipse_at_center,rgba(191,128,255,0.18),transparent_55%)]",
          "blur-[40px]",
        )}
      />

      <div className="relative mx-auto flex max-w-4xl flex-col items-center px-4 text-center lg:px-8">
        <p className="mb-4 text-sm font-medium tracking-wide text-violet-300/80">
          Powered by Terminal 3 Agent Identity
        </p>

        <p className="mb-10 max-w-xl text-slate-400">
          Enterprise autonomous treasury with trusted AI agents — hover below to enter
          Sentinel Treasury.
        </p>

        <Link
          href="/demo"
          className="group mb-10 flex w-full max-w-3xl flex-col items-center text-slate-100 transition-colors hover:text-violet-200"
          aria-label="Enter Sentinel Treasury demo"
        >
          <TextDisperse className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl">
            Sentinel
          </TextDisperse>
          <p className="mt-4 flex items-center justify-center gap-2 text-sm text-slate-500 transition-colors group-hover:text-violet-300/80">
            Explore the autonomous treasury
            <ArrowRight className="h-4 w-4" />
          </p>
        </Link>

        <p className="mb-8 max-w-lg text-xs text-slate-500 sm:text-sm">
          Identity → Authorization → Protected Action → Audit
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button
            size="lg"
            asChild
            className="border-0 bg-[#BF80FF] text-slate-950 shadow-lg shadow-violet-500/20 hover:bg-[#C896FF]"
          >
            <Link href="/demo">
              Start Live Demo
              <ArrowRight className="h-5 w-5" />
            </Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            asChild
            className="border-slate-600 bg-black/50 text-slate-100 backdrop-blur-sm hover:bg-slate-900"
          >
            <Link href="/architecture">View Architecture</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
