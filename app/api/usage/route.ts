import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { getSession } from "@/lib/auth/session";
import { db, schema } from "@/lib/db";

export async function GET() {
  const session = await getSession();
  if (!session.userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const rows = await db.query.usageLog.findMany({
    where: eq(schema.usageLog.userId, session.userId),
    orderBy: [desc(schema.usageLog.createdAt)],
    limit: 100,
  });

  return NextResponse.json({
    items: rows.map((r) => ({
      id: r.id,
      model: r.model,
      inputTokens: r.inputTokens,
      outputTokens: r.outputTokens,
      costMicroUsdc: r.costMicroUsdc.toString(),
      source: r.source,
      createdAt: r.createdAt,
    })),
  });
}
