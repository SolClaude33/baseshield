import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth/session";
import { db, schema } from "@/lib/db";

const FREE_TIER_LIMIT = 3;

export async function GET() {
  const session = await getSession();
  if (!session.userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const user = await db.query.users.findFirst({ where: eq(schema.users.id, session.userId) });
  if (!user) return NextResponse.json({ error: "not found" }, { status: 404 });

  const freeRemaining = Math.max(0, FREE_TIER_LIMIT - user.freeMessagesUsed);
  return NextResponse.json({
    microUsdc: user.balanceMicroUsdc.toString(),
    formatted: (Number(user.balanceMicroUsdc) / 1_000_000).toFixed(4),
    freeMessagesUsed: user.freeMessagesUsed,
    freeRemaining,
    freeTierLimit: FREE_TIER_LIMIT,
  });
}
