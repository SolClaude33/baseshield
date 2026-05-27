import { NextResponse } from "next/server";
import { z } from "zod";
import { runChat } from "@/lib/llm/providers";
import { DEFAULT_MODEL, MODELS, type ModelId } from "@/lib/llm/pricing";
import {
  buildPaymentRequirements,
  verifyPayment,
  settlePayment,
  encodeSettleResponse,
} from "@/lib/x402";

// Flat per-call price in atomic USDC (6 decimals). 5000 = $0.005 / call.
const PRICE_ATOMIC = process.env.X402_PRICE_ATOMIC ?? "5000";

const BodySchema = z.object({
  model: z.string().optional(),
  messages: z.array(
    z.object({
      role: z.enum(["system", "user", "assistant"]),
      content: z.string(),
    }),
  ),
});

function paymentRequirements(resource: string) {
  const payTo = process.env.NEXT_PUBLIC_DEPOSIT_ADDRESS;
  if (!payTo || payTo === "0x0000000000000000000000000000000000000000") return null;
  return buildPaymentRequirements({
    resource,
    amountAtomic: PRICE_ATOMIC,
    description: "BaseShield encrypted AI chat completion",
    payTo,
  });
}

export async function POST(req: Request) {
  const url = req.url;
  const requirements = paymentRequirements(url);
  if (!requirements) {
    return NextResponse.json(
      { error: "x402 not configured — set NEXT_PUBLIC_DEPOSIT_ADDRESS" },
      { status: 500 },
    );
  }

  // STEP 1: no payment header → 402 with requirements
  const paymentHeader = req.headers.get("x-payment");
  if (!paymentHeader) {
    return NextResponse.json(
      {
        x402Version: 1,
        error: "payment required",
        accepts: [requirements],
      },
      { status: 402 },
    );
  }

  // STEP 2: verify signed payment with facilitator
  const verify = await verifyPayment(paymentHeader, requirements);
  if (!verify.isValid) {
    return NextResponse.json(
      {
        x402Version: 1,
        error: "invalid payment",
        reason: verify.invalidReason ?? "verification failed",
        accepts: [requirements],
      },
      { status: 402 },
    );
  }

  // STEP 3: parse body + choose model
  const body = await req.json().catch(() => null);
  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }
  const modelId = (parsed.data.model as ModelId) ?? DEFAULT_MODEL;
  if (!(modelId in MODELS) || MODELS[modelId].soon) {
    return NextResponse.json(
      { error: `unsupported model '${modelId}'` },
      { status: 400 },
    );
  }

  // STEP 4: run inference
  let result;
  try {
    result = await runChat(modelId, parsed.data.messages);
  } catch (e) {
    console.error("x402 LLM error:", e);
    return NextResponse.json({ error: "upstream error" }, { status: 502 });
  }

  // STEP 5: settle the payment (broadcast on-chain)
  const settle = await settlePayment(paymentHeader, requirements);

  const headers: Record<string, string> = {};
  if (settle.success) {
    headers["X-PAYMENT-RESPONSE"] = encodeSettleResponse(settle);
  }

  return NextResponse.json(
    {
      message: result.text,
      model: modelId,
      usage: {
        inputTokens: result.inputTokens,
        outputTokens: result.outputTokens,
      },
      payment: {
        settled: settle.success,
        txHash: settle.txHash ?? null,
        network: "base",
        amount: PRICE_ATOMIC,
      },
    },
    { headers },
  );
}
