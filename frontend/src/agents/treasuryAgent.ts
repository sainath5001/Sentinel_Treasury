import type { ChatCompletionTool } from "openai/resources/chat/completions";
import { formatRecipientDirectoryForPrompt } from "@/config/recipients";
import { TREASURY_POLICIES } from "@/config/policies";
import { paymentProposalSchema, type PaymentProposal } from "@/types/agents";
import { resolveRecipientName } from "@/config/recipients";
import { runToolCall } from "./openai";

const AGENT_ID = "Treasury Agent";
const TOOL_NAME = "create_payment_proposal";

const SYSTEM_PROMPT = `You are the ${AGENT_ID} for Sentinel Treasury, an enterprise autonomous treasury platform.

Your job is to interpret natural-language payment requests and produce structured payment proposals.

Rules:
- Token symbol is ${TREASURY_POLICIES.tokenSymbol} (also accept aliases: ${TREASURY_POLICIES.tokenAliases.join(", ")})
- Resolve payee names using the recipient directory when possible
- If the user provides a 0x address directly, use it
- Never invent or guess Ethereum addresses
- If amount or recipient is ambiguous, set parseable=false and list clarificationsNeeded
- Provide treasury recommendations when relevant (e.g. batching payments, timing)
- confidence should reflect how certain you are about the extraction (0-1)

${formatRecipientDirectoryForPrompt()}

Always call the ${TOOL_NAME} tool with your structured output.`;

const TOOL_DEFINITION: ChatCompletionTool = {
  type: "function",
  function: {
    name: TOOL_NAME,
    description: "Create a structured payment proposal from a natural language treasury request",
    parameters: {
      type: "object",
      properties: {
        recipientName: { type: "string", description: "Payee name mentioned by user" },
        recipientAddress: {
          type: ["string", "null"],
          description: "Resolved 0x Ethereum address or null if unknown",
        },
        amount: { type: "string", description: "Decimal amount as string, e.g. 100" },
        tokenSymbol: { type: "string", description: "Token symbol, default STT" },
        description: { type: "string", description: "Payment purpose memo" },
        urgency: { type: "string", enum: ["normal", "urgent"] },
        confidence: { type: "number", description: "Extraction confidence 0-1" },
        clarificationsNeeded: { type: "array", items: { type: "string" } },
        recommendations: { type: "array", items: { type: "string" } },
        parseable: { type: "boolean", description: "Whether request was successfully structured" },
      },
      required: [
        "recipientName",
        "recipientAddress",
        "amount",
        "tokenSymbol",
        "description",
        "urgency",
        "confidence",
        "clarificationsNeeded",
        "recommendations",
        "parseable",
      ],
      additionalProperties: false,
    },
  },
};

export interface TreasuryAgentInput {
  message: string;
  context?: {
    treasuryBalance?: string;
    requesterAddress?: string;
  };
}

export interface TreasuryAgentOutput {
  agent: typeof AGENT_ID;
  proposal: PaymentProposal;
}

/**
 * Interprets a natural-language treasury request and returns a structured payment proposal.
 */
export async function runTreasuryAgent(input: TreasuryAgentInput): Promise<TreasuryAgentOutput> {
  const userPrompt = [
    `User request: "${input.message}"`,
    input.context?.treasuryBalance
      ? `Current treasury balance: ${input.context.treasuryBalance} ${TREASURY_POLICIES.tokenSymbol}`
      : null,
    input.context?.requesterAddress ? `Requester: ${input.context.requesterAddress}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  const { data } = await runToolCall({
    systemPrompt: SYSTEM_PROMPT,
    userPrompt,
    tool: TOOL_DEFINITION,
    schema: paymentProposalSchema,
    toolName: TOOL_NAME,
  });

  // Deterministic post-processing: resolve names from directory if LLM missed it
  let proposal = { ...data };
  if (!proposal.recipientAddress && proposal.recipientName) {
    const resolved = resolveRecipientName(proposal.recipientName);
    if (resolved) {
      proposal = { ...proposal, recipientAddress: resolved, confidence: Math.min(1, proposal.confidence + 0.1) };
    }
  }

  // Normalize token symbol
  if (TREASURY_POLICIES.tokenAliases.map((a) => a.toUpperCase()).includes(proposal.tokenSymbol.toUpperCase())) {
    proposal = { ...proposal, tokenSymbol: TREASURY_POLICIES.tokenSymbol };
  }

  return { agent: AGENT_ID, proposal };
}
