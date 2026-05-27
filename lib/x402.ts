/**
 * x402 — HTTP-native micropayments on Base via USDC.
 * Spec: https://x402.org
 *
 * Flow:
 *   1. Client POSTs without X-PAYMENT header  →  server replies 402 + paymentRequirements
 *   2. Client signs an EIP-3009 transferWithAuthorization (USDC) and resends
 *      with X-PAYMENT header (base64-encoded JSON payload)
 *   3. Server verifies the payment with the facilitator → if valid, fulfill
 *   4. Server settles the payment (broadcasts the signed tx) → returns response
 *      with X-PAYMENT-RESPONSE header
 */

const FACILITATOR_URL = process.env.X402_FACILITATOR_URL ?? "https://x402.org/facilitator";
const USDC_BASE = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";

export interface PaymentRequirements {
  scheme: "exact";
  network: "base";
  maxAmountRequired: string; // atomic units (USDC = 6 decimals)
  resource: string;
  description: string;
  mimeType: string;
  payTo: string;
  maxTimeoutSeconds: number;
  asset: string;
  extra?: { name: string; version: string };
}

export function buildPaymentRequirements(opts: {
  resource: string;
  amountAtomic: string;
  description: string;
  payTo: string;
}): PaymentRequirements {
  return {
    scheme: "exact",
    network: "base",
    maxAmountRequired: opts.amountAtomic,
    resource: opts.resource,
    description: opts.description,
    mimeType: "application/json",
    payTo: opts.payTo,
    maxTimeoutSeconds: 300,
    asset: USDC_BASE,
    extra: { name: "USD Coin", version: "2" },
  };
}

function decodePayment(headerB64: string): unknown {
  return JSON.parse(Buffer.from(headerB64, "base64").toString("utf-8"));
}

export interface VerifyResult {
  isValid: boolean;
  invalidReason?: string;
  payer?: string;
}

export async function verifyPayment(
  paymentPayloadB64: string,
  requirements: PaymentRequirements,
): Promise<VerifyResult> {
  try {
    const paymentPayload = decodePayment(paymentPayloadB64);
    const r = await fetch(`${FACILITATOR_URL}/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paymentPayload, paymentRequirements: requirements }),
    });
    if (!r.ok) {
      return { isValid: false, invalidReason: `facilitator ${r.status}` };
    }
    return (await r.json()) as VerifyResult;
  } catch (e) {
    return {
      isValid: false,
      invalidReason: e instanceof Error ? e.message : "decode failed",
    };
  }
}

export interface SettleResult {
  success: boolean;
  txHash?: string;
  network?: string;
  error?: string;
}

export async function settlePayment(
  paymentPayloadB64: string,
  requirements: PaymentRequirements,
): Promise<SettleResult> {
  try {
    const paymentPayload = decodePayment(paymentPayloadB64);
    const r = await fetch(`${FACILITATOR_URL}/settle`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paymentPayload, paymentRequirements: requirements }),
    });
    if (!r.ok) {
      return { success: false, error: `facilitator ${r.status}` };
    }
    return (await r.json()) as SettleResult;
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "settle failed",
    };
  }
}

export function encodeSettleResponse(s: SettleResult): string {
  return Buffer.from(JSON.stringify(s)).toString("base64");
}
