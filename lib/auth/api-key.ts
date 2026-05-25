import { createHash, randomBytes } from "node:crypto";

const PREFIX = "sk_baseshield_";

export function generateApiKey(): { plaintext: string; hash: string; prefix: string } {
  const body = randomBytes(24).toString("base64url");
  const plaintext = `${PREFIX}${body}`;
  const hash = hashApiKey(plaintext);
  const prefix = plaintext.slice(0, PREFIX.length + 6);
  return { plaintext, hash, prefix };
}

export function hashApiKey(plaintext: string): string {
  return createHash("sha256").update(plaintext).digest("hex");
}

export function isValidApiKeyFormat(value: string): boolean {
  return value.startsWith(PREFIX) && value.length > PREFIX.length + 16;
}
