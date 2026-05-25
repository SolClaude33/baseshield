import { NextResponse } from "next/server";
import { SiweMessage } from "siwe";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth/session";
import { db, schema } from "@/lib/db";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session.nonce) {
    return NextResponse.json({ error: "no nonce in session" }, { status: 400 });
  }

  const { message, signature } = (await req.json()) as { message: string; signature: string };
  const siwe = new SiweMessage(message);

  try {
    const result = await siwe.verify({ signature, nonce: session.nonce });
    if (!result.success) {
      return NextResponse.json({ error: "invalid signature" }, { status: 401 });
    }
  } catch (e) {
    return NextResponse.json({ error: "verification failed" }, { status: 401 });
  }

  const wallet = siwe.address.toLowerCase();
  const existing = await db.query.users.findFirst({ where: eq(schema.users.walletAddress, wallet) });
  const user =
    existing ??
    (await db.insert(schema.users).values({ walletAddress: wallet }).returning())[0];

  session.userId = user.id;
  session.walletAddress = wallet;
  session.nonce = undefined;
  await session.save();

  return NextResponse.json({ ok: true, walletAddress: wallet });
}
