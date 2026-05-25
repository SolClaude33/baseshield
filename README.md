# BaseShield

Private AI gateway on Base. Pay-per-call in USDC from your wallet, no signup.

This repo holds the v1 app (Next.js + Vercel Postgres) and the public docs (`docs/`).

---

## Local setup

### 1. Install

```bash
pnpm install   # or npm install
```

### 2. Set up Vercel Postgres

1. Create a project on [Vercel](https://vercel.com).
2. In the project, go to **Storage** → **Create** → **Postgres**.
3. Vercel will inject `POSTGRES_URL` and friends. Locally, pull them with:

```bash
vercel env pull .env.development.local
```

### 3. Fill in `.env.local`

Copy `.env.example` to `.env.local` and fill in:

| Variable | Where to get it |
|---|---|
| `POSTGRES_URL` | From `vercel env pull` (auto) |
| `SESSION_SECRET` | `openssl rand -base64 32` |
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | [cloud.reown.com](https://cloud.reown.com) (free) |
| `NEXT_PUBLIC_ALCHEMY_KEY` | [dashboard.alchemy.com](https://dashboard.alchemy.com) (free) |
| `ALCHEMY_WEBHOOK_SECRET` | Set when you create the Alchemy Notify webhook |
| `OPENAI_API_KEY` | [platform.openai.com](https://platform.openai.com/api-keys) |
| `ANTHROPIC_API_KEY` | [console.anthropic.com](https://console.anthropic.com) |
| `GROQ_API_KEY` | [console.groq.com](https://console.groq.com) |
| `NEXT_PUBLIC_DEPOSIT_ADDRESS` | A Base address you control — users send USDC here |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` locally |

### 4. Push the DB schema

```bash
pnpm db:push
```

### 5. Run

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Deploy on Vercel

1. Push this repo to GitHub.
2. Import it on Vercel.
3. Attach the Postgres store you created above.
4. Set all the env vars from `.env.example` in **Project Settings → Environment Variables**.
5. Deploy.

### Wire up the deposit watcher

Once deployed, set up an **Alchemy Notify** "Address Activity" webhook:
1. Go to [dashboard.alchemy.com](https://dashboard.alchemy.com) → **Notify** → **Create Webhook**.
2. Network: **Base Mainnet**. Type: **Address Activity**.
3. URL: `https://YOUR_DOMAIN/api/webhook/alchemy`.
4. Addresses: your `NEXT_PUBLIC_DEPOSIT_ADDRESS`.
5. Copy the signing key → paste into `ALCHEMY_WEBHOOK_SECRET` env var.

Now any USDC sent to your deposit address from a registered user wallet will be credited automatically.

---

## How it works

```
User → connects wallet → signs SIWE message → session cookie issued
     → sends USDC to NEXT_PUBLIC_DEPOSIT_ADDRESS
     → Alchemy webhook hits /api/webhook/alchemy → balance credited in DB
     → uses /chat or generates API key from /dashboard
     → each call deducts from balance, logged in usage_log
```

### Tables

- **users** — wallet → balance (micro-USDC)
- **api_keys** — hashed keys per user
- **deposits** — every credited USDC tx (idempotent on tx_hash)
- **usage_log** — every LLM call with token counts and cost

### Auth

- **Web sessions:** SIWE + iron-session encrypted cookie.
- **API:** `Authorization: Bearer sk_baseshield_...`

### Billing

- Balance is held in `users.balance_micro_usdc` (bigint).
- Each `/api/chat` call computes cost from `lib/llm/pricing.ts` (input + output tokens × per-model rate) and atomically deducts.
- A 402 is returned when balance ≤ 0.

---

## Project structure

```
app/
├── page.tsx                 landing
├── chat/                    chat UI
├── dashboard/               wallet info, balance, keys, usage
└── api/
    ├── auth/
    │   ├── nonce            issue SIWE nonce
    │   ├── verify           verify signature → set session
    │   ├── session          read current session
    │   └── logout
    ├── balance              GET user balance
    ├── keys                 list/create API keys
    ├── keys/[id]            revoke
    ├── usage                last 100 usage rows
    ├── chat                 LLM proxy (session OR bearer auth)
    └── webhook/alchemy      USDC deposit credit
components/
lib/
├── db/                      drizzle schema + client
├── auth/                    session + api-key helpers
├── llm/                     pricing + provider adapters
├── wagmi.ts
└── utils.ts
docs/                        public documentation (separate from app)
public/
├── logo-dark.png
└── logo-light.png
```

---

## v1 scope (what's in)

- ✅ Wallet-only auth (SIWE, no email)
- ✅ USDC top-up via Alchemy webhook
- ✅ Chat UI with multi-model selection
- ✅ API key generation + bearer auth
- ✅ Usage tracking + per-call billing
- ✅ Dark/light theme with logos

## What's NOT in v1 (roadmap)

- ❌ TEE encryption (Phala dStack) — coming v2
- ❌ Railgun shielded swaps — coming v2
- ❌ MCP server package
- ❌ Agent Privacy API
- ❌ SERV reasoning / skill graphs
- ❌ `$SHIELD` token as payment method (token launches via Clanker independently)

---

## License

TBD
