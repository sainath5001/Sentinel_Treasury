import { T3_FEATURES } from "@/content/features";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function ProtectedActionFlow() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>T3 Protected Action Flow</CardTitle>
        <CardDescription>
          Every agent step executes through this 5-step security pipeline
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative space-y-0">
          <div className="absolute left-4 top-2 bottom-2 w-px bg-gradient-to-b from-cyan-500/50 to-emerald-500/50" />
          {T3_FEATURES.map((step, i) => (
            <div key={step.step} className="relative flex gap-4 pb-5 pl-10 last:pb-0">
              <div className="absolute left-2 top-0 flex h-5 w-5 items-center justify-center rounded-full border border-cyan-500 bg-slate-950 text-[10px] font-bold text-cyan-400">
                {step.step}
              </div>
              <div className="flex-1 rounded-lg border border-slate-800 bg-slate-950/40 p-3">
                <p className="text-sm font-medium text-slate-200">{step.title}</p>
                <p className="mt-1 text-xs text-slate-500">{step.description}</p>
                {i === T3_FEATURES.length - 1 && (
                  <p className="mt-2 text-[10px] text-emerald-400">
                    ✓ Attestation returned in orchestrate response
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
