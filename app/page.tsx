import Link from "next/link";
import { HeroChatInput } from "@/components/hero-chat-input";
import { Logo } from "@/components/logo";
import { FlowDiagram } from "@/components/flow-diagram";
import { Lock, Wallet, Zap, Cpu, Network, ShieldCheck, Coins, KeyRound } from "lucide-react";

export default function Landing() {
  return (
    <>
      {/* HERO */}
      <section className="relative">
        <div className="absolute inset-0 hero-glow pointer-events-none" />
        <div className="mx-auto max-w-6xl px-6 pt-28 pb-40 md:pt-40 md:pb-56 relative">
          <h1 className="font-serif italic text-8xl md:text-[10rem] leading-[0.9] tracking-tight">
            Private AI.
          </h1>
          <p className="mt-14 md:mt-20 max-w-xl text-base md:text-lg text-muted-foreground leading-relaxed">
            AI chat with verifiable privacy on Base. Your prompts stay encrypted — from us, and from the models you&apos;re talking to. Pay per call in USDC from your wallet.
          </p>

          <div className="mt-20 md:mt-28 max-w-2xl">
            <HeroChatInput />
          </div>
        </div>
      </section>

      {/* BUILT WITH */}
      <section className="bg-card/30">
        <div className="mx-auto max-w-6xl px-6 py-16 md:py-20">
          <p className="text-center text-xs uppercase tracking-[0.2em] text-muted-foreground">Built on</p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-16 gap-y-6 opacity-70">
            <BuiltOn name="BASE" />
            <BuiltOn name="x402" />
            <BuiltOn name="RAILGUN" />
            <BuiltOn name="PHALA" />
            <BuiltOn name="GROQ" />
          </div>
        </div>
      </section>

      {/* PRODUCT CARDS */}
      <section className="mx-auto max-w-7xl px-6 py-32 md:py-44">
        <div className="grid gap-5 md:grid-cols-3 lg:grid-cols-5">
          <ProductCard
            badge="Live"
            icon={<Wallet className="size-5" />}
            title="Wallet login"
            body="No email, no card. Sign once with your Base wallet."
          />
          <ProductCard
            badge="Live"
            icon={<Coins className="size-5" />}
            title="USDC pay-per-call"
            body="Deposit USDC on Base, spend as you go, withdraw anytime."
          />
          <ProductCard
            badge="Live"
            icon={<Zap className="size-5" />}
            title="Multi-model gateway"
            body="GPT, Claude, and open-source models behind one API."
          />
          <ProductCard
            badge="Live"
            icon={<KeyRound className="size-5" />}
            title="API keys for devs"
            body="OpenAI-compatible. Drop-in for existing clients."
          />
          <ProductCard
            badge="Live"
            icon={<Network className="size-5" />}
            title="x402 paywall"
            body="Per-call USDC settlement for agents — no API key needed."
          />
        </div>

        <div className="mt-5 grid gap-5 md:grid-cols-3">
          <ProductCard
            badge="Live"
            icon={<ShieldCheck className="size-5" />}
            title="TEE encryption"
            body="Intel TDX confidential VMs on Phala dStack. Verifiable attestation on Base."
          />
          <ProductCard
            badge="Live"
            icon={<Lock className="size-5" />}
            title="Railgun shielded payments"
            body="Shielded ERC-20 deposits and withdrawals — your top-ups stay private on-chain."
          />
          <ProductCard
            badge="Live"
            icon={<Cpu className="size-5" />}
            title="MCP server + Agent API"
            body="Drop-in tools for Claude Desktop, Cursor, and any A2A-aware agent."
          />
        </div>
      </section>

      {/* E2E ENCRYPTION VISUAL */}
      <section className="relative">
        <div className="mx-auto max-w-7xl px-6 py-40 md:py-56">
          <div className="mb-10 flex items-center gap-4">
            <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">How it works</span>
            <span className="h-px flex-1 bg-border" />
          </div>

          <div className="max-w-2xl">
            <h2 className="font-serif text-5xl md:text-7xl leading-[0.95] tracking-tight">
              End-to-end<br />encrypted.
            </h2>
            <p className="mt-8 text-base md:text-lg text-muted-foreground leading-relaxed">
              Your data stays encrypted end to end. We can&apos;t see it. Nobody can.
            </p>
          </div>

          <div className="mt-32 md:mt-40">
            <FlowDiagram />
          </div>
        </div>
      </section>

      {/* DEV CTA */}
      <section className="bg-card/30">
        <div className="mx-auto max-w-5xl px-6 py-32 md:py-44">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Developers</p>
          <h2 className="mt-4 font-serif italic text-4xl md:text-6xl leading-[1.05]">Drop-in for any OpenAI-compatible client.</h2>
          <p className="mt-6 max-w-2xl text-base md:text-lg text-muted-foreground leading-relaxed">
            One API key, every major model. Connect your wallet, generate a key, send requests.
          </p>
          <pre className="mt-12 overflow-x-auto rounded-xl border border-border bg-background p-6 font-mono text-xs leading-relaxed">
{`curl https://baseshield.xyz/api/chat \\
  -H "Authorization: Bearer sk_baseshield_..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "gpt-4o-mini",
    "messages": [{"role":"user","content":"hello"}]
  }'`}
          </pre>
          <div className="mt-12 flex flex-wrap items-center gap-3">
            <Link
              href="/sdk"
              className="inline-flex items-center gap-2 rounded-lg bg-[#0052ff] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#0040cc] transition"
            >
              Generate API key
            </Link>
            <Link
              href="/docs"
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-5 py-2.5 text-sm font-medium hover:bg-muted transition"
            >
              Read the docs
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-border/40">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-16 text-xs text-muted-foreground md:flex-row">
          <div className="flex items-center gap-2">
            <Logo className="size-5" />
            <span>BaseShield · Private AI on Base</span>
          </div>
          <div className="flex items-center gap-5">
            <Link href="/docs" className="hover:text-foreground">Docs</Link>
            <a href="https://github.com/SolClaude33/baseshield" target="_blank" rel="noreferrer" className="hover:text-foreground">GitHub</a>
            <a href="https://x.com/BaseShieldPriv" target="_blank" rel="noreferrer" className="hover:text-foreground">Twitter</a>
          </div>
        </div>
      </footer>
    </>
  );
}

function BuiltOn({ name }: { name: string }) {
  return (
    <span className="font-mono text-sm tracking-widest text-muted-foreground">{name}</span>
  );
}

function ProductCard({
  badge,
  icon,
  title,
  body,
  muted = false,
}: {
  badge: string;
  icon: React.ReactNode;
  title: string;
  body: string;
  muted?: boolean;
}) {
  return (
    <div className="group relative overflow-hidden rounded-xl border border-border bg-card p-5 transition hover:border-foreground/20">
      <div className="flex items-center justify-between">
        <div className={`inline-flex size-9 items-center justify-center rounded-lg ${muted ? "bg-muted text-muted-foreground" : "bg-[#0052ff]/10 text-[#0052ff]"}`}>
          {icon}
        </div>
        <span
          className={`rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${
            muted ? "border-border text-muted-foreground" : "border-[#0052ff]/40 bg-[#0052ff]/10 text-[#0052ff]"
          }`}
        >
          {badge}
        </span>
      </div>
      <h3 className="mt-4 font-semibold">{title}</h3>
      <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{body}</p>
    </div>
  );
}

