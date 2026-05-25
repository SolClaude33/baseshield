// Usage: node scripts/list-ark-models.mjs
// Reads ARK_API_KEY + ARK_BASE_URL from .env.local and lists what models Ark accepts.

import { readFileSync } from "node:fs";
import { join } from "node:path";

function loadEnv() {
  const env = {};
  try {
    const raw = readFileSync(join(process.cwd(), ".env.local"), "utf8");
    for (const line of raw.split("\n")) {
      const m = line.match(/^([A-Z_]+)=(.*)$/);
      if (m) env[m[1]] = m[2].trim();
    }
  } catch {}
  return env;
}

const env = loadEnv();
const apiKey = env.ARK_API_KEY;
const baseUrl = env.ARK_BASE_URL ?? "https://ark.ap-southeast.bytepluses.com/api/v3";

if (!apiKey) {
  console.error("ARK_API_KEY missing in .env.local");
  process.exit(1);
}

const url = `${baseUrl}/models`;
console.log(`GET ${url}`);

const r = await fetch(url, {
  headers: { Authorization: `Bearer ${apiKey}` },
});

console.log(`status: ${r.status}`);
const body = await r.text();

try {
  const json = JSON.parse(body);
  if (json.data) {
    console.log(`\n${json.data.length} models available:\n`);
    for (const m of json.data) {
      console.log(`  ${m.id}${m.owned_by ? `   (by ${m.owned_by})` : ""}`);
    }
  } else {
    console.log(JSON.stringify(json, null, 2));
  }
} catch {
  console.log(body);
}
