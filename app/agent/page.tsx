import Link from "next/link";
import { DotIcon } from "@/components/dot-icon";

const TOOLS = [
  { name: "Token Research", desc: "Multi-source token analysis with real-time pricing and DEX data.", icon: "square" },
  { name: "Wallet Analysis", desc: "Portfolio breakdown with holdings, valuations, and transaction history.", icon: "person" },
  { name: "Liquidity Analysis", desc: "Trading depth, buy/sell pressure, and market health metrics.", icon: "cpu" },
  { name: "Comparative Analysis", desc: "Side-by-side comparison of volume, liquidity, and price action.", icon: "smile" },
  { name: "Content Research", desc: "Scrape any URL and get an AI-powered summary instantly.", icon: "lock" },
  { name: "Encrypted Inference", desc: "End-to-end encrypted AI on decentralized GPUs.", icon: "square" },
  { name: "Site Crawler", desc: "Full website crawl with JavaScript rendering support.", icon: "cpu" },
  { name: "Repo Research", desc: "AI-powered GitHub repo analysis via DeepWiki.", icon: "lock" },
  { name: "Base Dev", desc: "End-to-end EVM dev — Foundry, Hardhat, wallets, deployment.", icon: "cpu" },
  { name: "Private Swap", desc: "In-line private swaps via Railgun shielded pool + 0x routing.", icon: "smile" },
  { name: "Crypto Archives", desc: "Curated crypto literature, investor theses, and protocol docs.", icon: "square" },
  { name: "Trending Tokens", desc: "Live trending tokens on Base from DexScreener with price data.", icon: "smile" },
  { name: "On-chain Activity", desc: "Wallet flows, contract calls, and whale tracking across Base.", icon: "person" },
] as const;

export default function AgentPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-20">
      {/* HEADER */}
      <div className="mb-6 flex items-center gap-4">
        <span className="h-px flex-1 bg-border" />
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          Agent Framework
        </span>
      </div>

      <h1 className="font-serif text-6xl md:text-7xl leading-[0.95] tracking-tight">
        BaseShield Agent.
      </h1>
      <p className="mt-6 max-w-xl text-base text-muted-foreground leading-relaxed">
        Private AI inference with {TOOLS.length} built-in tools. The agent autonomously decides which tools to use based on your query.
      </p>

      {/* TOOLS */}
      <section className="mt-24">
        <SectionHeader num="01" label="Available tools" />
        <h2 className="mt-6 font-serif text-3xl md:text-4xl tracking-tight">
          Everything the agent can do.
        </h2>
        <p className="mt-3 max-w-xl text-sm text-muted-foreground">
          Each tool is callable autonomously. The model routes your query to whichever is needed — no configuration required.
        </p>

        <div className="mt-10 grid gap-3 md:grid-cols-2">
          {TOOLS.map((t) => (
            <div key={t.name} className="flex items-start gap-4 rounded-xl border border-border bg-card p-4">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-background">
                <DotIcon name={t.icon} size="sm" tone="primary" />
              </div>
              <div>
                <h3 className="font-semibold">{t.name}</h3>
                <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{t.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* INTEGRATION */}
      <section className="mt-24">
        <SectionHeader num="02" label="Integration" />
        <h2 className="mt-6 font-serif text-3xl md:text-4xl tracking-tight">Start calling it.</h2>
        <p className="mt-3 text-sm text-muted-foreground">
          Send a request and the agent selects tools automatically.
        </p>

        <div className="mt-10 grid gap-4 md:grid-cols-2">
          <CodeBlock
            label="Request"
            sublabel="cURL"
            code={`curl -X POST "https://api.baseshield.xyz/agent" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "prompt": "What is the current price of ETH?",
    "model": "gpt-oss-120b",
    "useTools": true
  }'`}
          />
          <CodeBlock
            label="Response"
            sublabel="JSON"
            code={`{
  "success": true,
  "reply": "ETH is currently trading at $3,420 USD.",
  "toolCalls": [
    {
      "tool": "token_price",
      "args": { "token": "ETH" },
      "result": { "price": 3420 }
    }
  ],
  "iterations": 2,
  "cost": "0.0012"
}`}
          />
        </div>

        <div className="mt-6">
          <CodeBlock
            label="Encrypted mode"
            sublabel="E2E"
            code={`// Enable end-to-end encryption
{
  "prompt": "Check my wallet balance",
  "encrypted": true,
  "encryptionKey": "YOUR_PUBLIC_KEY",
  "useTools": true
}

// Response is encrypted - only you can decrypt
{
  "success": true,
  "encrypted": true,
  "encryptedResponse": "0x...",
  "privacyGuarantee": {
    "backendSawPlaintext": false,
    "toolsExecutedInTEE": true
  }
}`}
          />
        </div>
      </section>

      {/* CTA */}
      <section className="mt-24">
        <SectionHeader num="03" label="Get Started" />
        <h2 className="mt-6 font-serif text-3xl md:text-4xl tracking-tight">Get your API key.</h2>
        <p className="mt-3 text-sm text-muted-foreground">
          Free tier available. No credit card required to start.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link
            href="/sdk"
            className="inline-flex items-center gap-2 rounded-lg bg-foreground px-5 py-2.5 text-sm font-medium text-background hover:opacity-90"
          >
            Get API Key
          </Link>
          <Link
            href="/docs"
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-5 py-2.5 text-sm font-medium hover:bg-muted"
          >
            Read Docs
          </Link>
        </div>
      </section>
    </div>
  );
}

function SectionHeader({ num, label }: { num: string; label: string }) {
  return (
    <div className="flex items-center gap-4">
      <span className="font-mono text-xs italic text-muted-foreground">{num}</span>
      <span className="h-px flex-1 bg-border" />
      <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{label}</span>
    </div>
  );
}

function CodeBlock({ label, sublabel, code }: { label: string; sublabel?: string; code: string }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{label}</span>
        {sublabel && (
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{sublabel}</span>
        )}
      </div>
      <pre className="overflow-x-auto rounded-xl border border-border bg-card p-5 font-mono text-xs leading-relaxed h-full">
        {code}
      </pre>
    </div>
  );
}
