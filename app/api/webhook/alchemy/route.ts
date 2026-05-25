import { NextResponse } from "next/server";
import { createHmac } from "node:crypto";
import { eq, sql } from "drizzle-orm";
import { db, schema } from "@/lib/db";

const USDC_BASE = "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913".toLowerCase();

interface AlchemyTransferActivity {
  fromAddress: string;
  toAddress: string;
  hash: string;
  blockNum: string;
  rawContract?: { address?: string };
  value: number;
  asset?: string;
  category: string;
}

interface AlchemyWebhookPayload {
  event?: { activity?: AlchemyTransferActivity[] };
}

function verifySignature(body: string, signature: string | null): boolean {
  const secret = process.env.ALCHEMY_WEBHOOK_SECRET;
  if (!secret || !signature) return false;
  const digest = createHmac("sha256", secret).update(body).digest("hex");
  return digest === signature;
}

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("x-alchemy-signature");
  if (!verifySignature(body, signature)) {
    return NextResponse.json({ error: "invalid signature" }, { status: 401 });
  }

  const depositAddress = (process.env.NEXT_PUBLIC_DEPOSIT_ADDRESS ?? "").toLowerCase();
  if (!depositAddress) {
    return NextResponse.json({ error: "deposit address not configured" }, { status: 500 });
  }

  const payload = JSON.parse(body) as AlchemyWebhookPayload;
  const activities = payload.event?.activity ?? [];

  let credited = 0;
  for (const a of activities) {
    if (a.category !== "token") continue;
    if ((a.rawContract?.address ?? "").toLowerCase() !== USDC_BASE) continue;
    if (a.toAddress.toLowerCase() !== depositAddress) continue;

    const fromAddr = a.fromAddress.toLowerCase();
    const txHash = a.hash.toLowerCase();
    const blockNumber = BigInt(parseInt(a.blockNum, 16));

    // Alchemy gives `value` as a decimal number of tokens — convert to micro-USDC (6 decimals).
    const microUsdc = BigInt(Math.floor(a.value * 1_000_000));
    if (microUsdc <= 0n) continue;

    const user = await db.query.users.findFirst({ where: eq(schema.users.walletAddress, fromAddr) });
    if (!user) continue; // Sender not a registered user — ignore (could queue for later claim).

    try {
      await db.transaction(async (tx) => {
        await tx.insert(schema.deposits).values({
          userId: user.id,
          txHash,
          amountMicroUsdc: microUsdc,
          blockNumber,
          fromAddress: fromAddr,
        });
        await tx
          .update(schema.users)
          .set({ balanceMicroUsdc: sql`${schema.users.balanceMicroUsdc} + ${microUsdc}` })
          .where(eq(schema.users.id, user.id));
      });
      credited++;
    } catch {
      // unique violation on tx_hash means we've seen this tx before — skip silently
    }
  }

  return NextResponse.json({ ok: true, credited });
}
