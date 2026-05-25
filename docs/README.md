# BaseShield Documentation

The first cryptographically private AI infrastructure layer on **Base**. Not another wrapper — real cryptographic guarantees that your prompts and responses never leave encryption.

---

## Why BaseShield?

Every AI interaction you have today is logged, stored, and analyzed. Existing providers store your prompts indefinitely, require PII to sign up, and offer vague privacy policies with no technical enforcement.

We built infrastructure where **we can't see your data**. Not because of policy — because of math and hardware.

---

## What's Encrypted, and How

We get this question often, so to be precise:

**Today, in production:**
- **Client-side encryption:** `libsodium` sealed-box style envelope (X25519 key agreement + XSalsa20-Poly1305 AEAD). The session payload is sealed to the TEE's attested X25519 public key before it leaves the user's machine.
- **Inference isolation:** Intel **TDX** Confidential VM (a Trusted Execution Environment) hosted on **Phala dStack**. Plaintext exists only inside attested enclave memory; no host process — including ours — can read it. The TEE's X25519 keypair is generated inside the CVM at boot; the private key never leaves the enclave.
- **Transport:** encrypted end-to-end between the client and the enclave; the BaseShield backend is a blind relay.
- **Verifiable attestation:** the enclave publishes an Intel-signed TDX quote that binds the public key to the exact code measurement. You can verify the running image yourself — see [Verifiable Attestation](#verifiable-attestation) below.

**What we are not (yet) doing:**
- We are **not running pure FHE inference**. No production system runs LLM-scale inference under fully homomorphic encryption today — the latency is many orders of magnitude away from viable. Anyone claiming "FHE LLM inference" in production in 2026 is overclaiming.

**Why TEE + Railgun is the right stack for Base today:**
- Intel TDX is the same hardware substrate trusted by Apple Private Cloud Compute, Signal, and every major confidential-computing deployment of 2025. It's mature, audited, and the attestation chain reaches Intel's root.
- **Railgun** gives us shielded ERC-20 / ETH transfers natively on Base — a battle-tested ZK privacy pool, not a roll-your-own mixer. We don't reinvent privacy crypto; we compose what works.

**Roadmap:** as FHE coprocessors (Fhenix, Inco) mature on EVM, components of the pipeline that don't need full LLM-scale plaintext can migrate into cryptographic compute. The client encryption layer stays unchanged.

**TL;DR** — End-to-end encrypted in transit + Intel-TDX-isolated during compute + Railgun-shielded for on-chain actions, with a real on-chain attestation contract on Base. Calling this "FHE" today would be wrong; calling it "verifiable private AI infrastructure on Base" is accurate.

```
You (Browser / SDK)
    │
    ├── libsodium sealed-box encrypts prompt client-side
    │   with TEE's attested X25519 public key
    │
    ▼
BaseShield Backend
    │
    ├── Cannot decrypt. Routes encrypted blob blindly
    │
    ▼
Intel TDX Enclave (Phala dStack)
    │
    ├── Hardware-isolated decryption inside the enclave
    ├── Calls the model provider with plaintext (in-enclave only)
    ├── Encrypts response with the session's ephemeral key
    │
    ▼
BaseShield Backend
    │
    ├── Still can't see anything
    │
    ▼
You
    │
    └── Decrypt with your ephemeral private key
```

**Zero knowledge. End-to-end. Verifiable.**

---

## Verifiable Attestation

Every TEE response is backed by a real Intel-signed TDX quote. You don't have to trust us — you can verify the enclave yourself.

**Live endpoints:**
- `GET /tee/public-key` → the X25519 public key currently used for client-side encryption.
- `GET /tee/attestation` → the Intel TDX quote, with `report_data = keccak256(pubkey)`. This binds the public key to the exact code measurement running inside the CVM.

**What you can check:**
- The TDX quote chains to Intel's root and indicates the host is a genuine TDX CPU.
- The event log includes verifiable measurements of the exact stack running (`compose-hash`, `app-id`, `os-image-hash`, `mr-kms`), so you can confirm the code that processed your prompt is the code we publish.

**On-chain anchor:**
The BaseShield attestation contract is deployed on **Base mainnet** at `0xBA5E5H1ELDA77E57A710N0xxxxxxxxxxxxxxxxxx` *(TBD on deploy)*. Each privacy-mode session emits an `AttestationPublished(sessionId, pubkey, quoteHash)` event that links the request to the attested TEE — settling on-chain that this specific interaction was processed inside a verified enclave.

---

## Products

### 1. Privacy SDK — `@baseshield/sdk`

Integrate private AI into your applications. The SDK handles encryption automatically — it fetches the TEE's attested public key, encrypts client-side, sends the blob through BaseShield, and decrypts the response with your ephemeral session key.

```bash
npm install @baseshield/sdk
```

**Basic chat (encrypted by default):**

```typescript
import { BaseShield } from '@baseshield/sdk';

const client = new BaseShield({
  apiKey: 'sk_baseshield_...'
});

// Encrypted end-to-end. BaseShield backend never sees plaintext.
const response = await client.chat('What are the risks of this DeFi protocol?');
console.log(response.message);
```

**Choosing a model:**

```typescript
const response = await client.chat('Summarize the latest Base sequencer incident', {
  model: 'claude-sonnet-4',         // gpt-oss-20b | gpt-4o-mini | gemini-flash | claude-sonnet | claude-sonnet-4
});
```

**Opt out of encryption (faster, plaintext path):**

```typescript
const response = await client.chat('Hello', { encrypted: false });
```

**SERV-guided reasoning** (tool-augmented agent path — see [Agent Framework](#agent-framework)):

```typescript
const response = await client.chat('Compare Aerodrome vs Uniswap v3 LP returns on Base', {
  reasoning: 'braid',  // routes through the agent endpoint with guided reasoning
});
```

**Check balance:**

```typescript
const { usdcBalance, shieldBalance } = await client.balance();
```

**Why this matters:** no email, no credit card, no KYC. Connect a Base wallet on [baseshield.xyz/sdk](https://baseshield.xyz/sdk), generate an API key, and start building. Pricing is metered per call in USDC (or `$SHIELD`) from your prepaid balance.

### 2. Agent Tools SDK — `@baseshield/agent-tools`

Typed tools for the **BaseShield Agent Privacy API** (`/agents/v1`). Drop-in adapters for OpenAI, Anthropic, and Vercel AI SDK function-calling — so your existing LLM agents can quote, execute, and settle privacy-preserving swaps + encrypted inference without writing the orchestration yourself.

```bash
npm install @baseshield/agent-tools
```

**Vercel AI SDK quickstart:**

```typescript
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { BaseShieldAgentClient } from "@baseshield/agent-tools";
import { aiSdkTools } from "@baseshield/agent-tools/ai-sdk";

const baseshield = new BaseShieldAgentClient({
  apiKey: process.env.BASESHIELD_API_KEY,
});

const result = await generateText({
  model: openai("gpt-4o"),
  tools: aiSdkTools(baseshield),
  prompt: "Privately swap 0.01 ETH to USDC and send the USDC to 0xAAA...XXX",
});
```

**Anthropic quickstart:**

```typescript
import Anthropic from "@anthropic-ai/sdk";
import { anthropicTools, BaseShieldAgentClient, callTool, type ToolName } from "@baseshield/agent-tools";

const anthropic = new Anthropic();
const baseshield = new BaseShieldAgentClient({ apiKey: process.env.BASESHIELD_API_KEY });

const msg = await anthropic.messages.create({
  model: "claude-opus-4-7",
  max_tokens: 1024,
  tools: anthropicTools,
  messages: [{ role: "user", content: "Quote a private 1 ETH → USDC swap on Base" }],
});

for (const block of msg.content) {
  if (block.type === "tool_use") {
    const out = await callTool(baseshield, block.name as ToolName, block.input as Record<string, unknown>);
    // ...send tool_result back per Anthropic message loop
  }
}
```

**Direct (no LLM):**

```typescript
import { BaseShieldAgentClient } from "@baseshield/agent-tools";

const client = new BaseShieldAgentClient({ apiKey: "sk_baseshield_..." });

const session = await client.swapOneshot({
  payerAddress: "0x...",
  fromToken: "0x4200000000000000000000000000000000000006",   // WETH on Base
  toToken:   "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",   // USDC on Base
  amount: "10000000000000000",                                 // 0.01 ETH in wei
  destinationAddress: "0x...",                                 // fresh address — no on-chain link to payer
});

// Agent signs session.fundingTx with their wallet, broadcasts, then:
await client.swapOneshotExecute(session.sessionId, fundingTxHash);
const settled = await client.pollUntilSettled(session.sessionId);
```

Authentication supports three tiers:
- **API key** — `Authorization: Bearer sk_baseshield_...`, billed from prepaid balance.
- **x402 (no key)** — per-call USDC settlement on Base mainnet via Coinbase facilitator. Discovery at [`/.well-known/x402`](https://baseshield.xyz/.well-known/x402).
- **Internal JWT** — for our own first-party products.

### 3. MCP Server — `@baseshield/mcp-server`

Use BaseShield from Claude Desktop, Cursor, or any MCP client.

```json
{
  "mcpServers": {
    "baseshield": {
      "command": "npx",
      "args": ["@baseshield/mcp-server"],
      "env": {
        "BASESHIELD_API_KEY": "sk_baseshield_..."
      }
    }
  }
}
```

**Privacy + research tools:**

| Tool | Description |
|------|-------------|
| `private_research` | Encrypted multi-source research (web + DEX + on-chain + AI synthesis) |
| `encrypted_chat` | Direct E2E encrypted AI query |
| `private_token_analysis` | Comprehensive encrypted token research |
| `private_wallet_audit` | Encrypted wallet intelligence |
| `list_models` | Available models with pricing |
| `account_balance` | USDC + `$SHIELD` credit balance |

**Agent Privacy API tools** (added in the agent-API release):

| Tool | Description |
|------|-------------|
| `shield_quote` | Quote a private swap with anonymity-set sizing |
| `shield_anonymity_set` | Inspect current Railgun anonymity set for a token pair |
| `shield_swap_oneshot` | One-shot swap session — agent signs funding tx |
| `shield_swap_oneshot_execute` | Submit signed funding tx hash to start execution |
| `shield_session_status` | Poll session state until `settled` |
| `shield_create_wallet` | Provision a managed shielded wallet for an agent |
| `shield_swap_managed` | Run a swap from a managed wallet |
| `shield_encrypt` | Shield a public balance into the Railgun pool on the same wallet |
| `shield_unshield` | Withdraw from the pool and forward to a fresh address |
| `shield_balance` | Read shielded balance of a managed wallet |
| `shield_attestation` | Fetch the on-chain attestation event for a session |
| `private_inference_paid` | x402-paywalled encrypted inference (no API key) |

### 4. Chat App

Multi-model access in one interface with encrypted chat history, file attachments, image/video generation, and a RAG knowledge base. Live at [baseshield.xyz/chat](https://baseshield.xyz/chat).

---

## Agent Framework

Tool-augmented AI agents with SERV guided reasoning and skill-graph knowledge injection.

### SERV Reasoning

SERV (Structured Execution via Reasoning Virtualization) replaces freeform LLM decision-making with deterministic guided reasoning diagrams (GRDs). Instead of the LLM deciding what to do at each step, SERV walks a pre-defined execution graph — the LLM is only called for synthesis.

**Results vs standard agent loops:**

| Metric       | Standard       | SERV         | Improvement |
|--------------|----------------|--------------|-------------|
| Quality      | 80/100         | 93/100       | +13         |
| Token cost   | 19,917/query   | 4,047/query  | -79.7%      |
| Latency      | 24.0s          | 15.7s        | -35%        |
| Reliability  | 100%           | 100%         | Parity      |

Key insight: don't ask a 20B model to make structural decisions — do it deterministically. The LLM is used only where it adds value: synthesis of collected data into natural language.

### Skill Graphs

Structured domain-knowledge layer that sits between tool execution and LLM synthesis. When a query matches skill-node triggers, the engine traverses connected nodes and injects relevant domain knowledge into the synthesis context.

**14 base knowledge nodes** covering:
- DeFi protocol analysis, liquidity risk, tokenomics
- Market analysis, on-chain signals, whale tracking
- Wallet analysis, portfolio risk assessment
- Privacy / encryption technology (TEE, ZK, FHE)
- Research methodology, source evaluation, comparative analysis
- Base / OP Stack / Superchain ecosystem knowledge

Skill graphs are selective — they only activate for complex queries where domain knowledge improves output quality. Simple queries (price checks, swap quotes) skip skill-graph traversal entirely to maintain speed.

### Built-in Tools

| Tool | Description |
|------|-------------|
| `web_search` | Search the web via Brave Search API for real-time information |
| `scrape_url` | Extract and clean content from any URL |
| `crawl_url` | Crawl entire websites via Cloudflare Browser Rendering (handles JS-heavy sites) |
| `base_balance` | Check ETH and ERC-20 balances for any Base address |
| `token_price` | Real-time price, volume, liquidity, market cap via DexScreener + 0x |
| `swap_quote` | DEX swap quotes from 0x aggregator (routes Uniswap v3, Aerodrome, BaseSwap) |
| `trending_tokens` | Trending / boosted tokens on Base from DexScreener with price data |
| `deepwiki` | AI-powered GitHub repository research via DeepWiki |

### Agent API Example

```bash
curl -X POST "https://api.baseshield.xyz/agent" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Compare Aerodrome vs Uniswap v3 LP returns on Base",
    "model": "gpt-oss:20b",
    "useTools": true
  }'
```

```json
{
  "success": true,
  "reply": "## Aerodrome vs Uniswap v3 on Base\n\n...",
  "toolCalls": [
    { "tool": "web_search", "args": { "query": "Aerodrome vs Uniswap v3 Base LP APR" } },
    { "tool": "token_price", "args": { "token": "AERO" } }
  ],
  "iterations": 4,
  "skillGraph": {
    "nodesTraversed": ["defi-analysis", "liquidity-risk", "comparative-analysis"],
    "relevanceScore": 0.72
  }
}
```

### Agent Privacy API — `/agents/v1`

A separate, agent-first surface for privacy-preserving on-chain actions and encrypted inference. Two execution modes:

- **Mode A — managed wallet:** the agent gets a long-lived shielded wallet, funds it once, then runs many private swaps from it. Custody window minimized — the per-wallet DEK is envelope-encrypted with our KMS-held KEK, and never persisted in plaintext.
- **Mode B — one-shot swap:** the agent receives an unsigned funding tx, signs with its own wallet, submits, and the orchestrator runs the shield → relay → unshield → 0x-swap → forward-to-destination pipeline using Railgun.

**Discovery:**
- [`/.well-known/agent-card.json`](https://baseshield.xyz/.well-known/agent-card.json) — A2A protocol v1.0 card with the full skill list.
- [`/.well-known/x402`](https://baseshield.xyz/.well-known/x402) — x402 paywall manifest. Per-call USDC pricing for agents without an API key.
- [`/agents/v1/openapi.json`](https://baseshield.xyz/agents/v1/openapi.json) — full OpenAPI 3.1 spec.
- [`/agents/v1/capabilities`](https://baseshield.xyz/agents/v1/capabilities) — capability summary.

**Inference (pay.sh-compatible):**
`POST /api/v1/x402/chat/completions` — sealed-box encrypted prompt in, encrypted response out, x402 USDC paywalled at $0.005 / call. Drop-in for any x402-aware agent.

---

## Supported Models

- **io.net:** Decentralized GPU inference — GPT-OSS 20B (default)
- **Qwen:** Qwen 3.6 Plus (1M context)
- **OpenAI:** GPT-5.4, GPT-4o, GPT-4o mini
- **Anthropic:** Claude 4.7 Opus, Claude 4.6 Sonnet, Claude 4.5 Sonnet, Claude 4.5 Haiku

All models are reachable through the same encrypted path — the TEE picks the upstream provider based on the model string, so the encryption guarantee is uniform.

---

## Links

- [Chat App](https://baseshield.xyz/chat)
- [SDK & API Keys](https://baseshield.xyz/sdk)
- [Agent](https://baseshield.xyz/agent)
- [Agent Privacy API capabilities](https://baseshield.xyz/agents/v1/capabilities)
- [TEE Attestation](https://baseshield.xyz/tee/attestation)
- [Twitter](https://twitter.com/BaseShield)

---

Built with privacy, powered by **Base** & **Railgun**.
