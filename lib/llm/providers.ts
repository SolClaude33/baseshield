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
 *
 * Lazy-initialized so missing env vars don't crash the build (only matter at request time).
 */
let _ark: OpenAI | undefined;
function getArk(): OpenAI {
  if (!_ark) {
    const apiKey = process.env.ARK_API_KEY;
    if (!apiKey) {
      throw new Error("ARK_API_KEY is not set");
    }
    _ark = new OpenAI({
      apiKey,
      baseURL: process.env.ARK_BASE_URL ?? "https://ark.ap-southeast.bytepluses.com/api/v3",
    });
  }
  return _ark;
}

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

  const r = await getArk().chat.completions.create({
    model: cfg.upstream,
    messages,
    // Reasoning models (GPT-OSS) use a chunk of tokens for internal reasoning before
    // emitting visible content. 500 ≈ enough headroom for reasoning + ~200-word answer.
    max_tokens: 500,
  });

  return {
    text: r.choices[0]?.message?.content ?? "",
    inputTokens: r.usage?.prompt_tokens ?? 0,
    outputTokens: r.usage?.completion_tokens ?? 0,
  };
}
