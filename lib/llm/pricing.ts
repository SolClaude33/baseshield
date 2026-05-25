// All prices in micro-USDC per 1M tokens (i.e. integer USD micros per million tokens).
// 1 USDC = 1_000_000 micro-USDC.
// Pricing includes our markup (~30%).

export type ModelId =
  | "gpt-oss-120b"
  | "deepseek-v3.1"
  | "claude-sonnet";

export interface ModelConfig {
  label: string;
  /** Identifier sent in the `model` field of the Ark API request. */
  upstream: string;
  inputPer1M: number;
  outputPer1M: number;
  soon?: boolean;
}

export const DEFAULT_MODEL: ModelId = "gpt-oss-120b";

export const MODELS: Record<ModelId, ModelConfig> = {
  "gpt-oss-120b": {
    label: "GPT-OSS 120B",
    upstream: "gpt-oss-120b-250805",
    inputPer1M: 195_000,    // $0.195 with markup
    outputPer1M: 975_000,   // $0.975 with markup
  },
  "deepseek-v3.1": {
    label: "DeepSeek V3.1",
    // Will work once you create a BytePlus endpoint and paste the ep-XXXX id here.
    upstream: "deepseek-v3-1-250821",
    inputPer1M: 351_000,    // $0.351 with markup
    outputPer1M: 1_430_000, // $1.430 with markup
    soon: true,
  },
  "claude-sonnet": {
    label: "Claude Sonnet 4.6",
    upstream: "claude-sonnet-not-available-on-ark",
    inputPer1M: 3_900_000,
    outputPer1M: 19_500_000,
    soon: true,
  },
};

export function costMicroUsdc(model: ModelId, inputTokens: number, outputTokens: number): bigint {
  const m = MODELS[model];
  const inCost = BigInt(Math.ceil((inputTokens * m.inputPer1M) / 1_000_000));
  const outCost = BigInt(Math.ceil((outputTokens * m.outputPer1M) / 1_000_000));
  return inCost + outCost;
}
