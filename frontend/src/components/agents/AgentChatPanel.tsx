"use client";

import { useState } from "react";
import { Bot, Loader2, Send, Sparkles } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useAgentOrchestrator } from "@/hooks/useAgentOrchestrator";
import { useTreasuryActions } from "@/hooks/useTreasuryActions";
import type { OrchestrateResponse } from "@/types/agents";
import { AgentIdentityBadge } from "@/components/terminal3/AgentIdentityBadge";
import { DEMO_PAYMENT_SCENARIOS } from "@/content/demo-scenario";

const EXAMPLE_PROMPTS = DEMO_PAYMENT_SCENARIOS.map((s) => s.prompt);

const AGENT_EXPLANATIONS: Record<string, string> = {
  treasury:
    "Parsed your natural language into a structured payment proposal. Resolved payee from the approved vendor directory.",
  compliance:
    "Evaluated amount against tiered policy thresholds and treasury balance. Deterministic rules override AI when thresholds are crossed.",
  approval:
    "Applied approval logic based on compliance tier — auto-approve, human approver, or CFO escalation.",
  audit:
    "Anchored a SHA-256 hash over the full pipeline metadata. This creates a verifiable audit record for regulators.",
};

export function AgentChatPanel() {
  const [message, setMessage] = useState("");
  const [result, setResult] = useState<OrchestrateResponse | null>(null);
  const { mutate, isPending, error } = useAgentOrchestrator();
  const { createRequest, isPending: isSubmitting } = useTreasuryActions();

  const handleSubmit = () => {
    if (!message.trim()) return;
    mutate(message, {
      onSuccess: (data) => setResult(data),
    });
  };

  const handleCreateOnChain = () => {
    if (!result?.proposal.recipientAddress) return;
    createRequest(
      result.proposal.recipientAddress as `0x${string}`,
      result.proposal.amount,
      result.proposal.description,
    );
  };

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500/10 border border-cyan-500/20">
            <Sparkles className="h-5 w-5 text-cyan-400" />
          </div>
          <div>
            <CardTitle>AI Agent Console</CardTitle>
            <CardDescription>
              Natural language → T3-protected 4-agent pipeline (GPT-4.1)
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-4">
        <div className="flex flex-wrap gap-2">
          {EXAMPLE_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => setMessage(prompt)}
              className="rounded-full border border-slate-700 bg-slate-900/50 px-3 py-1 text-xs text-slate-400 hover:border-cyan-500/30 hover:text-cyan-300 transition-colors"
            >
              {prompt}
            </button>
          ))}
        </div>

        <Textarea
          placeholder='e.g. "Pay Rahul 100 STT for consulting"'
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={3}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit();
            }
          }}
        />

        <Button onClick={handleSubmit} disabled={isPending || !message.trim()} className="w-full">
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Running agent pipeline…
            </>
          ) : (
            <>
              <Send className="h-4 w-4" /> Run Agents
            </>
          )}
        </Button>

        {error && <p className="text-sm text-red-400">{error.message}</p>}

        {result && (
          <div className="space-y-4 rounded-lg border border-slate-800 bg-slate-950/50 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-200">Pipeline Result</span>
              <div className="flex items-center gap-2">
                {result.agentMode === "demo" && (
                  <Badge variant="warning">Demo mode (no OpenAI)</Badge>
                )}
                <Badge variant={pipelineBadgeVariant(result.pipelineStatus)}>
                  {result.pipelineStatus}
                </Badge>
              </div>
            </div>

            {result.t3 && (
              <div className="flex items-center justify-between rounded-lg border border-cyan-500/20 bg-cyan-500/5 px-3 py-2">
                <span className="text-xs text-cyan-300">Terminal 3 Trail</span>
                <Badge variant={result.t3.allVerified ? "success" : "warning"}>
                  {result.t3.allVerified ? "All verified" : "Partial"}
                </Badge>
              </div>
            )}

            <T3AgentStep
              title="Treasury Agent"
              stepKey="treasury"
              t3={result.t3}
              explanation={AGENT_EXPLANATIONS.treasury}
              content={
                result.proposal.parseable
                  ? `${result.proposal.amount} ${result.proposal.tokenSymbol} → ${result.proposal.recipientName} (${result.proposal.recipientAddress ?? "unresolved"})`
                  : "Could not parse request"
              }
              confidence={result.proposal.confidence}
            />

            <T3AgentStep
              title="Compliance Agent"
              stepKey="compliance"
              t3={result.t3}
              explanation={AGENT_EXPLANATIONS.compliance}
              content={result.compliance.summary}
              badge={result.compliance.passed ? "pass" : "fail"}
              sub={`Risk score: ${result.compliance.riskScore}/100 · Tier: ${result.compliance.policyTier}`}
            />

            <T3AgentStep
              title="Approval Agent"
              stepKey="approval"
              t3={result.t3}
              explanation={AGENT_EXPLANATIONS.approval}
              content={result.approval.approvalSummary || result.approval.reason}
              badge={result.approval.decision}
              sub={
                result.approval.requiresHumanApproval
                  ? "Requires human approver wallet signature on-chain"
                  : undefined
              }
            />

            <T3AgentStep
              title="Audit Agent"
              stepKey="audit"
              t3={result.t3}
              explanation={AGENT_EXPLANATIONS.audit}
              content={result.audit.summary}
              sub={`Hash: ${result.audit.auditHash.slice(0, 18)}…`}
            />

            {result.proposal.recipientAddress && result.compliance.passed && (
              <Button
                variant="success"
                onClick={handleCreateOnChain}
                disabled={isSubmitting}
                className="w-full"
              >
                <Bot className="h-4 w-4" />
                Submit On-Chain Payment Request
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function T3AgentStep({
  title,
  stepKey,
  t3,
  content,
  badge,
  sub,
  explanation,
  confidence,
}: {
  title: string;
  stepKey: string;
  t3?: OrchestrateResponse["t3"];
  content: string;
  badge?: string;
  sub?: string;
  explanation?: string;
  confidence?: number;
}) {
  const attestation = t3?.attestations.find((a) => a.agentId === stepKey);

  return (
    <div className="rounded-lg border border-slate-800/80 p-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-cyan-400">{title}</span>
        <div className="flex items-center gap-1">
          {confidence !== undefined && (
            <Badge variant="default">{Math.round(confidence * 100)}% conf.</Badge>
          )}
          {badge && (
            <Badge variant={badge === "pass" || badge === "auto_approve" ? "success" : "info"}>
              {badge}
            </Badge>
          )}
        </div>
      </div>
      {explanation && (
        <p className="mt-2 text-[11px] italic text-slate-500 leading-relaxed">{explanation}</p>
      )}
      {attestation && (
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <AgentIdentityBadge did={attestation.agentDid} verified={attestation.verified} />
          {attestation.verified && (
            <Badge variant="success" className="text-[9px]">T3 Verified</Badge>
          )}
        </div>
      )}
      <p className="mt-2 text-sm text-slate-300">{content}</p>
      {sub && <p className="mt-1 font-mono text-xs text-slate-500">{sub}</p>}
      {attestation && (
        <div className="mt-2 rounded border border-slate-800 bg-slate-950/60 p-2">
          <p className="font-mono text-[10px] text-slate-500">
            T3 · {attestation.action} · {attestation.actionId}
          </p>
          <p className="mt-0.5 font-mono text-[9px] text-slate-600 truncate">
            Attestation: {attestation.attestation.slice(0, 48)}…
          </p>
        </div>
      )}
    </div>
  );
}

function pipelineBadgeVariant(
  status: OrchestrateResponse["pipelineStatus"],
): "success" | "warning" | "destructive" | "info" {
  switch (status) {
    case "completed":
      return "success";
    case "needs_clarification":
      return "warning";
    case "rejected":
      return "destructive";
    case "escalated":
      return "info";
    default:
      return "info";
  }
}
