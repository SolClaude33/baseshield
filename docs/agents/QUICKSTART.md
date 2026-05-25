# Quickstart — BaseShield Agent Privacy API

Five minutes to your first private swap on Base. Pick a surface.

## 1. Anthropic SDK

```ts
import Anthropic from "@anthropic-ai/sdk";
import { anthropicTools, callTool, BaseShieldAgentClient, type ToolName } from "@baseshield/agent-tools";

const anthropic = new Anthropic();
const baseshield = new BaseShieldAgentClient({ apiKey: process.env.BASESHIELD_API_KEY });

let messages = [{ role: "user", content: "Privately swap 0.01 ETH → USDC on Base, send USDC to 0xAAA…" }];
while (true) {
  const r = await anthropic.messages.create({
    model: "claude-opus-4-7", max_tokens: 1024, tools: anthropicTools, messages,
  });
  messages.push({ role: "assistant", content: r.content });
  const toolUses = r.content.filter((b) => b.type === "tool_use");
  if (toolUses.length === 0) break;
  for (const u of toolUses) {
    const out = await callTool(baseshield, u.name as ToolName, u.input as Record<string, unknown>);
    messages.push({ role: "user", content: [{ type: "tool_result", tool_use_id: u.id, content: JSON.stringify(out) }] });
  }
}
```

## 2. Vercel AI SDK

```ts
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { BaseShieldAgentClient } from "@baseshield/agent-tools";
import { aiSdkTools } from "@baseshield/agent-tools/ai-sdk";

const client = new BaseShieldAgentClient({ apiKey: process.env.BASESHIELD_API_KEY });
const result = await generateText({
  model: openai("gpt-4o"),
  tools: aiSdkTools(client),
  prompt: "Private swap 0.01 ETH to USDC on Base, deposit to 0xAAA…",
});
console.log(result.text);
```

## 3. Plain HTTP (no SDK, no LLM)

```bash
BASESHIELD=https://api.baseshield.xyz
KEY="sk_baseshield_..."

# Quote
curl "$BASESHIELD/agents/v1/quote?fromToken=0x4200000000000000000000000000000000000006&toToken=0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913&amount=10000000000000000" \
  -H "Authorization: Bearer $KEY"

# Mode B: kick off oneshot
SESSION=$(curl -s -X POST "$BASESHIELD/agents/v1/swaps/oneshot" \
  -H "Authorization: Bearer $KEY" -H "Content-Type: application/json" \
  -d '{"payerAddress":"0xYourWallet…","fromToken":"0x4200000000000000000000000000000000000006","toToken":"0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913","amount":"10000000000000000","destinationAddress":"0xDestAddr…"}')
echo "$SESSION" | jq .

# Sign + broadcast SESSION.fundingTx with your wallet (viem / ethers / Coinbase Wallet)
# Then submit the resulting tx hash:
curl -X POST "$BASESHIELD/agents/v1/swaps/oneshot/$ID/execute" \
  -H "Authorization: Bearer $KEY" -H "Content-Type: application/json" \
  -d "{\"fundingTxHash\":\"$HASH\"}"

# Poll
curl "$BASESHIELD/agents/v1/sessions/$ID" -H "Authorization: Bearer $KEY"
```

## 4. MCP (Cursor / Claude Desktop / Cline)

Add to your MCP config:

```json
{
  "mcpServers": {
    "baseshield-privacy": {
      "command": "npx",
      "args": ["@baseshield/mcp-server"],
      "env": { "BASESHIELD_API_KEY": "sk_baseshield_..." }
    }
  }
}
```

Then in chat: "Quote a private 1 ETH → USDC swap on Base." The agent will call `shield_quote` automatically.

## 5. Mode A — Managed wallet

```ts
import { BaseShieldAgentClient } from "@baseshield/agent-tools";
const client = new BaseShieldAgentClient({ apiKey: "sk_baseshield_..." });

// Provision once
const wallet = await client.createWallet();
console.log("Fund this shielded address:", wallet.shieldedAddress);

// (Send some ETH/USDC to wallet.shieldedAddress with your existing wallet)

// Then swap as many times as you want
const session = await client.swapManaged(wallet.walletId, {
  fromToken: "0x4200000000000000000000000000000000000006",   // WETH on Base
  toToken: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",     // USDC on Base
  amount: "10000000000000000",                                 // 0.01 ETH in wei
  destinationAddress: "0xFreshAddr…",
});
const settled = await client.pollUntilSettled(session.sessionId);
console.log("Settled:", settled);
```

## 6. Discovery

```bash
# A2A agent card (for A2A-aware clients)
curl https://api.baseshield.xyz/.well-known/agent-card.json | jq

# x402 paywall manifest
curl https://api.baseshield.xyz/.well-known/x402 | jq

# OpenAPI 3.1 spec
curl https://api.baseshield.xyz/agents/v1/openapi.json | jq

# Capabilities (custody modes, payment rails, discovery URLs)
curl https://api.baseshield.xyz/agents/v1/capabilities | jq
```
