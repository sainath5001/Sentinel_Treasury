"use client";

import { useState } from "react";
import { CheckCircle2, Circle, ExternalLink } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { JUDGING_CHECKLIST } from "@/content/judging-checklist";

const CATEGORY_COLORS: Record<string, "default" | "success" | "info" | "warning"> = {
  "Terminal 3": "info",
  "AI Agents": "default",
  Security: "warning",
  UX: "success",
  Blockchain: "default",
  Enterprise: "success",
};

export function JudgingChecklist() {
  const [checked, setChecked] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const progress = Math.round((checked.size / JUDGING_CHECKLIST.length) * 100);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Judging Checklist</CardTitle>
            <CardDescription>
              Track demo readiness for T3 judges, CTOs, and security reviewers
            </CardDescription>
          </div>
          <Badge variant={progress === 100 ? "success" : "info"}>{progress}% ready</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {JUDGING_CHECKLIST.map((item) => {
          const done = checked.has(item.id);
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => toggle(item.id)}
              className="w-full rounded-lg border border-slate-800 bg-slate-950/40 p-4 text-left transition-colors hover:border-slate-700"
            >
              <div className="flex items-start gap-3">
                {done ? (
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
                ) : (
                  <Circle className="mt-0.5 h-5 w-5 shrink-0 text-slate-600" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={CATEGORY_COLORS[item.category] ?? "default"}>
                      {item.category}
                    </Badge>
                    <Badge
                      variant={
                        item.status === "ready"
                          ? "success"
                          : item.status === "partial"
                            ? "warning"
                            : "default"
                      }
                    >
                      {item.status}
                    </Badge>
                  </div>
                  <p className={`mt-2 text-sm ${done ? "text-slate-500 line-through" : "text-slate-200"}`}>
                    {item.criterion}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">{item.talkingPoint}</p>
                  <Link
                    href={item.whereToDemo.split(" ")[0]}
                    onClick={(e) => e.stopPropagation()}
                    className="mt-2 inline-flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300"
                  >
                    {item.whereToDemo}
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            </button>
          );
        })}
      </CardContent>
    </Card>
  );
}
