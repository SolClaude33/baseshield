# BaseShield Agent Privacy API

Private Base swaps for AI agents — Railgun shielded pool + 0x routing, pay-per-call via x402. Base mainnet only.

## What this is

A polished HTTP + MCP surface that lets any agent — ours or external — execute an end-to-end private swap with one HTTP call (or one MCP tool call). No SDK install for Railgun; no ZK prover in your stack; no shielded-wallet juggling. Three auth tiers, two custody modes, six discovery channels.

```
┌─────────────────────────────────────────────────────────────────┐
│ Discovery                                                        │
│   /.well-known/agent-card.json  · /.well-known/x402              │
│   /agents/v1/openapi.json       · MCP HTTP / stdio               │
│   @baseshield/agent-tools (npm)                                  │
└─────────────────────────────────────────────────────────────────┘
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│ HTTP API  /agents/v1                                            │
│   x402 paywall · API-key auth · OFAC screening · bucketing      │
└─────────────────────────────────────────────────────────────────┘
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│ Orchestrator (lib/shieldpool-server)                            │
│   Node port of the in-chat Railgun flows. snarkjs Groth16       │
│   prover. Background worker; resumable via heartbeat lock.      │
└─────────────────────────────────────────────────────────────────┘
```

## Two custody modes

### Mode A — Managed shielded wallet (recommended for trading agents)

`POST /agents/v1/wallets` provisions a server-held Railgun keypair, envelope-encrypted at rest (AES-256-GCM, KEK from Supabase Vault). Agent funds it, then runs many swaps. Audit log queryable. Source-side anonymity grows with reuse.

### Mode B — One-shot ephemeral wallet

`POST /agents/v1/swaps/oneshot` returns an unsigned `fundingTx` for the agent to sign with their existing wallet, plus a session id. Server runs the entire Railgun shield + 0x swap + unshield flow on a per-call ephemeral, lands output at `destinationAddress`, wipes the keypair. Destination unlinkability only — chain still sees `payerAddress → ephemeralAddress`.

## State machine

```
created ─funding tx confirmed────► funded
funded ─shield to Railgun────────► shielded
shielded ─relay batch confirmed──► relayed
relayed ─private balance ready───► ready
ready ─0x swap inside pool───────► swapped
swapped ─unshield to dest────────► unshielded
unshielded ─output sent to dest──► settled
   any────────error / timeout────► failed | expired
```

## Auth tiers

| Tier | Header | Pricing |
|------|--------|---------|
| `anonymous` | (none) | x402 (`X-PAYMENT` header, USDC on Base mainnet via Coinbase facilitator) |
| `api_key`   | `Authorization: Bearer sk_baseshield_*` | Internal credit deduction OR x402 (lower price than anonymous) |
| `internal`  | `Authorization: Bearer <BASESHIELD_INTERNAL_JWT>` | Free — for our own agent products |

## Pricing (`/.well-known/x402`)

| Endpoint | x402 USDC | Notes |
|----------|-----------|-------|
| `GET /agents/v1/quote` | 0.001 | |
| `GET /agents/v1/anonymity-set` | free | |
| `POST /agents/v1/swaps/oneshot` | 0.10 + 5 bps spread | |
| `POST /agents/v1/wallets` | 0.05 | api_key / internal only |
| `POST /agents/v1/wallets/:id/swap` | 0.05 + 5 bps spread | |
| `POST /agents/v1/wallets/:id/fund-intent` | 0.001 | |
| `POST /agents/v1/wallets/:id/withdraw` | 0.05 | |
| `GET /agents/v1/wallets/:id/balance` | 0.005 | |
| `GET /agents/v1/wallets/:id/audit` | free | |
| `GET /agents/v1/sessions/:id` | free | |
| `GET /agents/v1/attestations/:sessionId` | free | |

5-bps spread is taken from the swap output before delivery; disclosed in the quote response.

## Security & privacy model

### What's hidden from the chain
- Amounts at the shielded-balance layer (Railgun ZK commitment scheme).
- Transaction-graph link between deposit and withdrawal (Railgun shielded pool).
- For Mode A: cumulative source unlinkability across many swaps.

### What BaseShield sees (be honest)
- Mode A: agent → wallet_id mapping; every sign event timestamp; swap intents.
- Mode B: payer → ephemeral → destination triple for ~60s, then dropped.
- Both: anonymity-set queries, billing.

### What BaseShield does NOT see
- Any agent tx that doesn't touch our API.
- The Railgun spending key and viewing keys are computed in process memory only and wiped after each request via `KeyHolder.wipe()`.

### Hardening
- Process-memory hygiene with explicit `wipe()` (Buffer.fill(0)).
- Envelope encryption (per-wallet DEK, KEK in Supabase Vault, KEK rotation supported).
- OFAC SDN screening on every destination; refuses with HTTP 451.
- Anonymity-set floor; off-bucket override gated behind `bypassBucket=true`.
- Rate limits (per API-key + per IP).
- HMAC-signed webhooks (`X-BaseShield-Signature: sha256=...`).
- Session retention 7 days; audit log 1 year.

### On-chain attestations
After settle, BaseShield emits a privacy attestation event from the on-chain attestation contract on Base (reuses `routes/attestation.js`). Verifiable on Basescan via `GET /agents/v1/attestations/:sessionId`.

## Files

- HTTP routes: `routes/agents/`
- Orchestrator: `lib/shieldpool-server/`
- Worker: `lib/agentSwapWorker.js`
- Vault: `lib/walletVault.js`
- x402 middleware: `lib/x402Middleware.js`
- OpenAPI source: `lib/shieldpool-server/openapi.js`
- MCP stdio server: `packages/mcp-server/src/index.ts`
- npm SDK: `packages/agent-tools-sdk/`
- Discovery: `routes/wellKnown.js`, `routes/agents/discovery.js`
- Skill: `skills/agent-private-swap/SKILL.md`
- Migrations: `migrations/009_agent_swap_sessions.sql`, `010_managed_shielded_wallets.sql`, `011_x402_payment_log.sql`
