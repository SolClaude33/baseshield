import OpenAI from "openai";
import { MODELS, type ModelId } from "./pricing";

/**
 * BytePlus ModelArk (International). OpenAI-compatible.
 * One API key (`ARK_API_KEY`) serves every model we expose — the upstream model id
 * lives in lib/llm/pricing.ts.
 *
 * Region URLs:
 *   - International: https://ark.ap-southeast.bytepluses.com/api/v3
 *   - China:         https://ark.cn-beijing.volces.com/api/v3
 */
const ark = new OpenAI({
  apiKey: process.env.ARK_API_KEY,
  baseURL: process.env.ARK_BASE_URL ?? "https://ark.ap-southeast.bytepluses.com/api/v3",
});

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatResult {
  text: string;
  inputTokens: number;
  outputTokens: number;
}

export async function runChat(model: ModelId, messages: ChatMessage[]): Promise<ChatResult> {
  const cfg = MODELS[model];

  if (cfg.soon) {
    throw new Error(`Model ${model} is not yet available`);
  }
  if (cfg.upstream.startsWith("REPLACE_ME_")) {
    throw new Error(`Model ${model} is not configured — set its Ark model/endpoint id in lib/llm/pricing.ts`);
  }

  const r = await ark.chat.completions.create({
    model: cfg.upstream,
    messages,
  });

  return {
    text: r.choices[0]?.message?.content ?? "",
    inputTokens: r.usage?.prompt_tokens ?? 0,
    outputTokens: r.usage?.completion_tokens ?? 0,
  };
}
