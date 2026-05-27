import { NextResponse } from "next/server";

const USDC_BASE = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";

export async function GET() {
  const payTo = process.env.NEXT_PUBLIC_DEPOSIT_ADDRESS;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.baseshieldpriv.xyz";
  const price = process.env.X402_PRICE_ATOMIC ?? "5000";

  return NextResponse.json({
    x402Version: 1,
    name: "BaseShield",
    description: "Private AI inference on Base. Pay per call in USDC via x402 — no API key, no signup.",
    contact: { twitter: "https://x.com/BaseShieldPriv" },
    endpoints: [
      {
        method: "POST",
        path: "/api/x402/chat/completions",
        url: `${appUrl}/api/x402/chat/completions`,
        description: "OpenAI-compatible chat completion endpoint, paid via x402.",
        accepts: [
          {
            scheme: "exact",
            network: "base",
            maxAmountRequired: price,
            asset: USDC_BASE,
            payTo: payTo ?? "",
            description: "Single chat completion call",
          },
        ],
      },
    ],
  });
}
