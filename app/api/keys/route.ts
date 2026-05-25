import { NextResponse } from "next/server";
import { and, eq, isNull, desc } from "drizzle-orm";
import { getSession } from "@/lib/auth/session";
import { db, schema } from "@/lib/db";
import { generateApiKey } from "@/lib/auth/api-key";

export async function GET() {
  const session = await getSession();
  if (!session.userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const keys = await db.query.apiKeys.findMany({
    where: and(eq(schema.apiKeys.userId, session.userId), isNull(schema.apiKeys.revokedAt)),
    orderBy: [desc(schema.apiKeys.createdAt)],
  });

  return NextResponse.json({
    keys: keys.map((k) => ({
      id: k.id,
      name: k.name,
      prefix: k.keyPrefix,
      lastUsedAt: k.lastUsedAt,
      createdAt: k.createdAt,
    })),
  });
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session.userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { name } = (await req.json().catch(() => ({}))) as { name?: string };

  const { plaintext, hash, prefix } = generateApiKey();
  const [row] = await db
    .insert(schema.apiKeys)
    .values({ userId: session.userId, keyHash: hash, keyPrefix: prefix, name: name || "Default" })
    .returning();

  // plaintext is returned ONCE; the user must store it.
  return NextResponse.json({
    id: row.id,
    name: row.name,
    plaintext,
    prefix: row.keyPrefix,
    createdAt: row.createdAt,
  });
}
