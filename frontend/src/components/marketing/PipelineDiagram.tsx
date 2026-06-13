export function PipelineDiagram() {
  const agents = ["Treasury", "Compliance", "Approval", "Audit"];

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/50 p-6">
      <div className="flex min-w-[600px] items-center justify-between gap-2">
        <div className="rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-4 py-3 text-center">
          <p className="text-[10px] uppercase tracking-wider text-cyan-400/70">Input</p>
          <p className="text-sm font-medium text-cyan-300">Natural Language</p>
        </div>

        {agents.map((agent, i) => (
          <div key={agent} className="flex flex-1 items-center gap-2">
            <span className="text-slate-600">→</span>
            <div className="flex-1 rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-3 text-center">
              <p className="text-[10px] text-slate-500">Agent {i + 1}</p>
              <p className="text-xs font-medium text-slate-200">{agent}</p>
              <p className="mt-1 text-[9px] text-emerald-400">T3 ✓</p>
            </div>
          </div>
        ))}

        <span className="text-slate-600">→</span>

        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-center">
          <p className="text-[10px] uppercase tracking-wider text-amber-400/70">Output</p>
          <p className="text-sm font-medium text-amber-300">On-Chain</p>
        </div>
      </div>

      <p className="mt-4 text-center text-xs text-slate-500">
        Every agent step wrapped by T3Gateway: identity → authorization → signed intent → attestation
      </p>
    </div>
  );
}
