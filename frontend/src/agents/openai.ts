import OpenAI from "openai";
import type { ChatCompletionTool } from "openai/resources/chat/completions";
import type { ZodSchema } from "zod";

export const OPENAI_MODEL = "gpt-4.1";

let client: OpenAI | null = null;

export function getOpenAIClient(): OpenAI {
  if (!client) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY is not configured");
    }
    client = new OpenAI({ apiKey });
  }
  return client;
}

export interface ToolCallResult<T> {
  data: T;
  rawArguments: string;
  toolName: string;
}

/**
 * Runs an OpenAI chat completion with a single required tool call,
 * then validates the tool arguments against a Zod schema.
 */
export async function runToolCall<T>({
  systemPrompt,
  userPrompt,
  tool,
  schema,
  toolName,
}: {
  systemPrompt: string;
  userPrompt: string;
  tool: ChatCompletionTool;
  schema: ZodSchema<T>;
  toolName: string;
}): Promise<ToolCallResult<T>> {
  const openai = getOpenAIClient();

  const response = await openai.chat.completions.create({
    model: OPENAI_MODEL,
    temperature: 0.1,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    tools: [tool],
    tool_choice: { type: "function", function: { name: toolName } },
  });

  const toolCall = response.choices[0]?.message?.tool_calls?.[0];
  if (!toolCall || toolCall.type !== "function") {
    throw new Error(`Agent did not return expected tool call: ${toolName}`);
  }

  const rawArguments = toolCall.function.arguments;
  let parsed: unknown;

  try {
    parsed = JSON.parse(rawArguments);
  } catch {
    throw new Error(`Agent returned invalid JSON for tool: ${toolName}`);
  }

  const validated = schema.safeParse(parsed);
  if (!validated.success) {
    throw new Error(`Agent output validation failed: ${validated.error.message}`);
  }

  return {
    data: validated.data,
    rawArguments,
    toolName,
  };
}
