// Usage: node scripts/test-ark-chat.mjs [model-id]
// Sends a tiny "say hi" prompt to Ark with the configured key.

import { readFileSync } from "node:fs";
import { join } from "node:path";

const env = {};
try {
  for (const line of readFileSync(join(process.cwd(), ".env.local"), "utf8").split("\n")) {
    const m = line.match(/^([A-Z_]+)=(.*)$/);
    if (m) env[m[1]] = m[2].trim();
  }
} catch {}

const apiKey = env.ARK_API_KEY;
const baseUrl = env.ARK_BASE_URL ?? "https://ark.ap-southeast.bytepluses.com/api/v3";
const model = process.argv[2] ?? "deepseek-v3-1-250821";

const r = await fetch(`${baseUrl}/chat/completions`, {
  method: "POST",
  headers: {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    model,
    messages: [{ role: "user", content: "Say 'hi' in 3 words." }],
    max_tokens: 500,
  }),
});

console.log(`status: ${r.status}`);
const body = await r.text();
try {
  const json = JSON.parse(body);
  console.log(JSON.stringify(json, null, 2));
} catch {
  console.log(body);
}
