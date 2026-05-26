import { NextResponse } from "next/server";
import { and, eq, isNull, sql } from "drizzle-orm";
import { z } from "zod";
import { getSession } from "@/lib/auth/session";
import { db, schema } from "@/lib/db";
import { hashApiKey } from "@/lib/auth/api-key";
import { MODELS, costMicroUsdc, type ModelId } from "@/lib/llm/pricing";
import { runChat } from "@/lib/llm/providers";

const FREE_TIER_LIMIT = 3;

const DEFAULT_SYSTEM_PROMPT =
  "You are BaseShield, a private AI assistant on Base. Be direct and concise — keep responses under 200 words unless the user explicitly asks for more detail. Prefer short paragraphs and bullet points over long prose. Do not pad answers with disclaimers, restatements, or filler.";

const BodySchema = z.object({
  model: z.string(),
  messages: z.array(
    z.object({
      role: z.enum(["system", "user", "assistant"]),
      content: z.string(),
    }),
  ),
});

export async function POST(req: Request) {
  const parse = BodySchema.safeParse(await req.json().catch(() => null));
  if (!parse.success) {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }
  const { model, messages } = parse.data;

  if (!(model in MODELS)) {
    return NextResponse.json({ error: `unknown model '${model}'` }, { status: 400 });
  }
  const modelId = model as ModelId;

  // Resolve user via API key (Bearer) or session cookie.
  const authHeader = req.headers.get("authorization");
  let userId: string | undefined;
  let apiKeyId: string | undefined;
  let source: "chat" | "api" = "chat";

  if (authHeader?.startsWith("Bearer ")) {
    const plaintext = authHeader.slice(7).trim();
    const keyRow = await db.query.apiKeys.findFirst({
      where: and(eq(schema.apiKeys.keyHash, hashApiKey(plaintext)), isNull(schema.apiKeys.revokedAt)),
    });
    if (!keyRow) return NextResponse.json({ error: "invalid api key" }, { status: 401 });
    userId = keyRow.userId;
    apiKeyId = keyRow.id;
    source = "api";
  } else {
    const session = await getSession();
    if (!session.userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    userId = session.userId;
  }

  // Check balance / free tier.
  const user = await db.query.users.findFirst({ where: eq(schema.users.id, userId!) });
  if (!user) return NextResponse.json({ error: "user not found" }, { status: 404 });
  const freeRemaining = Math.max(0, FREE_TIER_LIMIT - user.freeMessagesUsed);
  const usingFreeTier = freeRemaining > 0;
  if (!usingFreeTier && user.balanceMicroUsdc <= 0n) {
    return NextResponse.json(
      {
        error: "insufficient balance",
        reason: "free_tier_exhausted",
        message: `You've used all ${FREE_TIER_LIMIT} free messages. Deposit USDC on Base to continue.`,
      },
      { status: 402 },
    );
  }

  // Inject default system prompt unless the caller already provided one.
  const hasSystem = messages.some((m) => m.role === "system");
  const finalMessages = hasSystem
    ? messages
    : [{ role: "system" as const, content: DEFAULT_SYSTEM_PROMPT }, ...messages];

  // Run the call.
  let result;
  try {
    result = await runChat(modelId, finalMessages);
  } catch (e) {
    console.error("LLM error:", e);
    return NextResponse.json({ error: "upstream error" }, { status: 502 });
  }

  // Bill + log.
  const realCost = costMicroUsdc(modelId, result.inputTokens, result.outputTokens);
  const billedCost = usingFreeTier ? 0n : realCost;

  await db.transaction(async (tx) => {
    if (usingFreeTier) {
      await tx
        .update(schema.users)
        .set({ freeMessagesUsed: sql`${schema.users.freeMessagesUsed} + 1` })
        .where(eq(schema.users.id, userId!));
    } else {
      await tx
        .update(schema.users)
        .set({ balanceMicroUsdc: sql`${schema.users.balanceMicroUsdc} - ${billedCost}` })
        .where(eq(schema.users.id, userId!));
    }
    await tx.insert(schema.usageLog).values({
      userId: userId!,
      apiKeyId,
      model: modelId,
      inputTokens: result.inputTokens,
      outputTokens: result.outputTokens,
      costMicroUsdc: billedCost,
      source,
    });
    if (apiKeyId) {
      await tx
        .update(schema.apiKeys)
        .set({ lastUsedAt: new Date() })
        .where(eq(schema.apiKeys.id, apiKeyId));
    }
  });

  return NextResponse.json({
    message: result.text,
    model: modelId,
    usage: {
      inputTokens: result.inputTokens,
      outputTokens: result.outputTokens,
      costMicroUsdc: billedCost.toString(),
      costUsdc: (Number(billedCost) / 1_000_000).toFixed(6),
      freeTier: usingFreeTier,
      freeRemaining: Math.max(0, freeRemaining - 1),
    },
    encrypted: false, // v1 — TEE encryption coming in v2
  });
}
