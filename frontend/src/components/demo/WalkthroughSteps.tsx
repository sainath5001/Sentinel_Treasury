"use client";

import Link from "next/link";
import { ArrowRight, Clock, MapPin } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DEMO_WALKTHROUGH } from "@/content/walkthrough";

export function WalkthroughSteps() {
  return (
    <div className="space-y-4">
      {DEMO_WALKTHROUGH.map((step) => (
        <Card key={step.step} className="overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="info">Step {step.step}</Badge>
              <Badge variant="default">{step.duration}</Badge>
            </div>
            <CardTitle className="text-lg">{step.title}</CardTitle>
            <CardDescription>{step.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-slate-800 bg-slate-950/40 p-3">
                <p className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-slate-500">
                  <MapPin className="h-3 w-3" /> Where
                </p>
                <p className="mt-1 font-mono text-xs text-cyan-300">{step.route}</p>
              </div>
              <div className="rounded-lg border border-slate-800 bg-slate-950/40 p-3">
                <p className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-slate-500">
                  <Clock className="h-3 w-3" /> Action
                </p>
                <p className="mt-1 text-xs text-slate-300">{step.action}</p>
              </div>
            </div>
            <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3">
              <p className="text-[10px] uppercase tracking-wider text-emerald-400/70">
                Judge talking point
              </p>
              <p className="mt-1 text-sm text-emerald-200">{step.judgeNote}</p>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href={step.route}>
                Go to step <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
