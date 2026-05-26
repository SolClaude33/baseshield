"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useAccount } from "wagmi";
import { Copy, Trash2, Check, Wallet, KeyRound } from "lucide-react";
import { MODELS } from "@/lib/llm/pricing";
import { DotIcon } from "@/components/dot-icon";

interface ApiKeyRow {
  id: string;
  name: string;
  prefix: string;
  lastUsedAt: string | null;
  createdAt: string;
}

type Tab = "keys" | "quickstart" | "pricing";

export default function SdkPage() {
  const { isConnected } = useAccount();
  const [tab, setTab] = useState<Tab>("keys");
  const [keys, setKeys] = useState<ApiKeyRow[]>([]);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [keyName, setKeyName] = useState("");
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  const loadKeys = useCallback(async () => {
    const r = await fetch("/api/keys").then((res) => (res.ok ? res.json() : { keys: [] }));
    setKeys(r.keys ?? []);
  }, []);

  useEffect(() => {
    if (isConnected) loadKeys();
  }, [isConnected, loadKeys]);

  async function createKey() {
    setBusy(true);
    try {
      const r = await fetch("/api/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: keyName || "Default" }),
      });
      const data = await r.json();
      if (r.ok) {
        setNewKey(data.plaintext);
        setKeyName("");
        loadKeys();
      }
    } finally {
      setBusy(false);
    }
  }

  async function revokeKey(id: string) {
    if (!confirm("Revoke this key? Apps using it will stop working.")) return;
    await fetch(`/api/keys/${id}`, { method: "DELETE" });
    loadKeys();
  }

  if (!isConnected) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-32 text-center">
        <Wallet className="mx-auto size-10 text-muted-foreground" />
        <h2 className="mt-4 text-xl font-semibold">Connect your wallet</h2>
        <p className="mt-2 text-muted-foreground">
          Connect a Base wallet to manage API keys, monitor usage, and integrate the SDK.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-20">
      <div className="mb-6 flex items-center gap-4">
        <span className="h-px flex-1 bg-border" />
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          Privacy SDK
        </span>
      </div>

      <h1 className="font-serif text-6xl md:text-7xl leading-[0.95] tracking-tight">
        Developer Dashboard.
      </h1>
      <p className="mt-6 max-w-xl text-base text-muted-foreground leading-relaxed">
        Manage your keys, monitor usage, and integrate private AI into your applications.
      </p>

      <div className="mt-12 flex items-center gap-6 border-b border-border">
        <TabBtn active={tab === "keys"} onClick={() => setTab("keys")}>API Keys</TabBtn>
        <TabBtn active={tab === "quickstart"} onClick={() => setTab("quickstart")}>Quick Start</TabBtn>
        <TabBtn active={tab === "pricing"} onClick={() => setTab("pricing")}>Pricing</TabBtn>
      </div>

      {tab === "keys" && (
        <div className="mt-16">
          <SectionHeader num="01" label="Generate" />
          <h2 className="mt-6 font-serif text-3xl md:text-4xl tracking-tight">New API key.</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Create a new key for using the Privacy SDK. Name it optionally for easier identification.
          </p>

          {newKey && (
            <div className="mt-6 rounded-lg border border-[#0052ff]/40 bg-[#0052ff]/5 p-4">
              <p className="text-xs font-medium">Copy this key now — it won&apos;t be shown again.</p>
              <div className="mt-2 flex items-center gap-2">
                <code className="flex-1 break-all rounded bg-background px-3 py-2 font-mono text-xs">{newKey}</code>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(newKey);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 1500);
                  }}
                  className="inline-flex size-9 items-center justify-center rounded-md border border-border hover:bg-muted"
                >
                  {copied ? <Check className="size-4 text-emerald-500" /> : <Copy className="size-4" />}
                </button>
              </div>
              <button onClick={() => setNewKey(null)} className="mt-2 text-xs text-muted-foreground hover:text-foreground">
                Dismiss
              </button>
            </div>
          )}

          <div className="mt-6 flex items-center gap-3">
            <input
              value={keyName}
              onChange={(e) => setKeyName(e.target.value)}
              placeholder="Key name (optional)"
              className="flex-1 rounded-md border border-border bg-card px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#0052ff]/40"
            />
            <button
              onClick={createKey}
              disabled={busy}
              className="inline-flex items-center gap-1.5 rounded-md bg-foreground px-5 py-2.5 text-sm font-medium text-background hover:opacity-90 disabled:opacity-50"
            >
              <KeyRound className="size-4" />
              Generate
            </button>
          </div>

          <div className="mt-20">
            <SectionHeader num="02" label="Your Keys" />
            <h2 className="mt-6 font-serif text-3xl md:text-4xl tracking-tight">Active keys.</h2>

            {keys.length === 0 ? (
              <p className="mt-8 text-sm text-muted-foreground">No keys yet. Generate one above.</p>
            ) : (
              <ul className="mt-8 divide-y divide-border border-y border-border">
                {keys.map((k) => (
                  <li key={k.id} className="flex items-center justify-between py-4">
                    <div>
                      <div className="font-mono text-sm">{k.prefix}…</div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        {k.name} · Created {new Date(k.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <button
                      onClick={() => revokeKey(k.id)}
                      className="inline-flex size-9 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-destructive"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {tab === "quickstart" && (
        <div className="mt-16 space-y-24">
          <div>
            <SectionHeader num="01" label="How it works" />
            <h2 className="mt-6 font-serif text-3xl md:text-4xl tracking-tight">The privacy flow.</h2>
            <p className="mt-3 max-w-xl text-sm text-muted-foreground">
              Four stages — your data stays encrypted end to end, even from our backend.
            </p>
            <div className="mt-10 grid gap-4 md:grid-cols-4">
              <FlowCard num="01" title="Client Encryption" body="SDK encrypts your prompt with libsodium." iconName="lock" />
              <FlowCard num="02" title="Blind Backend" body="Server receives encrypted blob only." iconName="square" />
              <FlowCard num="03" title="TEE Processing" body="Decryption happens in hardware enclave." iconName="cpu" />
              <FlowCard num="04" title="Private Response" body="Response encrypted back to you." iconName="smile" />
            </div>
          </div>

          <div>
            <SectionHeader num="02" label="Integrate" />
            <h2 className="mt-6 font-serif text-3xl md:text-4xl tracking-tight">A few lines of code.</h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Install the SDK, drop in your key, ship encrypted AI.
            </p>
            <CodeBlock label="Install" code={`npm install @baseshield/sdk`} />
            <CodeBlock
              label="Usage"
              code={`import { BaseShield } from '@baseshield/sdk';

const client = new BaseShield({
  apiKey: 'sk_baseshield_your_key_here'
});

// Your prompt is encrypted client-side
const response = await client.chat(
  'Explain quantum computing',
  { model: 'gpt-oss-120b' }
);

console.log(response.message);`}
            />
          </div>

          <div>
            <SectionHeader num="03" label="Verify" />
            <h2 className="mt-6 font-serif text-3xl md:text-4xl tracking-tight">Test your setup.</h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Verify your API key and confirm encrypted chat works.
            </p>
            <CodeBlock
              label="Verify API key"
              code={`import { BaseShield } from '@baseshield/sdk';

const client = new BaseShield({
  apiKey: 'sk_baseshield_your_key_here'
});

async function main() {
  try {
    const balance = await client.getBalance();
    console.log('API key valid! Balance:', balance.balanceFormatted);
  } catch (error) {
    console.error('Invalid API key');
  }
}
main();`}
            />
            <CodeBlock
              label="Run test script"
              code={`# Copy and run the test script
cp node_modules/@baseshield/sdk/examples/test-connection.ts ./
BASESHIELD_API_KEY=your_key npx ts-node test-connection.ts`}
            />
            <p className="mt-3 text-xs text-muted-foreground">
              Tests: API key validity, encrypted chat, and live web search.
            </p>
          </div>
        </div>
      )}

      {tab === "pricing" && (
        <div className="mt-16">
          <SectionHeader num="01" label="Pricing" />
          <h2 className="mt-6 font-serif text-3xl md:text-4xl tracking-tight">Pay per use.</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            No subscriptions, no commitments. Pay only for what you use, settled in USDC.
          </p>

          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {Object.entries(MODELS).map(([id, m]) => (
              <div
                key={id}
                className={`rounded-2xl border p-6 ${m.soon ? "border-border bg-card/40 opacity-70" : "border-border bg-card"}`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-serif text-2xl">{m.label}</h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {m.soon ? "Coming soon to BaseShield" : "Available now"}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${
                      m.soon ? "border border-border bg-muted text-muted-foreground" : "border border-[#0052ff]/40 bg-[#0052ff]/10 text-[#0052ff]"
                    }`}
                  >
                    {m.soon ? "Soon" : "Available"}
                  </span>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-4 border-t border-border pt-6">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Input</p>
                    <p className="mt-1 font-serif text-2xl">
                      ${(m.inputPer1M / 1_000_000).toFixed(3)}
                      <span className="text-sm text-muted-foreground">/M</span>
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Output</p>
                    <p className="mt-1 font-serif text-2xl">
                      ${(m.outputPer1M / 1_000_000).toFixed(3)}
                      <span className="text-sm text-muted-foreground">/M</span>
                    </p>
                  </div>
                </div>

                <Link
                  href="/chat"
                  className={`mt-6 block w-full rounded-lg py-2.5 text-center text-sm font-medium ${
                    m.soon
                      ? "cursor-not-allowed bg-muted text-muted-foreground"
                      : "bg-foreground text-background hover:opacity-90"
                  }`}
                >
                  {m.soon ? "Coming soon" : "Get Started"}
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function TabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`relative -mb-px border-b-2 pb-3 text-sm font-medium transition ${
        active ? "border-foreground text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
      }`}
    >
      {children}
    </button>
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

function FlowCard({
  num,
  title,
  body,
  iconName,
}: {
  num: string;
  title: string;
  body: string;
  iconName: "lock" | "cpu" | "square" | "smile";
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between text-xs">
        <span className="font-mono italic text-muted-foreground">{num}</span>
      </div>
      <div className="mt-4 flex justify-center">
        <DotIcon name={iconName} size="md" tone="primary" />
      </div>
      <h3 className="mt-5 font-semibold">{title}</h3>
      <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{body}</p>
    </div>
  );
}

function CodeBlock({ label, code }: { label: string; code: string }) {
  return (
    <div className="mt-6">
      <div className="mb-2 flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{label}</span>
      </div>
      <pre className="overflow-x-auto rounded-xl border border-border bg-card p-5 font-mono text-xs leading-relaxed">
        {code}
      </pre>
    </div>
  );
}
