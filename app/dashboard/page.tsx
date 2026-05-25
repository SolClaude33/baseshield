"use client";

import { useEffect, useState, useCallback } from "react";
import { useAccount } from "wagmi";
import { Copy, Plus, Trash2, Check, Wallet } from "lucide-react";
import { shortenAddress } from "@/lib/utils";

interface ApiKeyRow {
  id: string;
  name: string;
  prefix: string;
  lastUsedAt: string | null;
  createdAt: string;
}

interface UsageRow {
  id: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  costMicroUsdc: string;
  source: string;
  createdAt: string;
}

export default function DashboardPage() {
  const { address, isConnected } = useAccount();
  const [balance, setBalance] = useState<string | null>(null);
  const [keys, setKeys] = useState<ApiKeyRow[]>([]);
  const [usage, setUsage] = useState<UsageRow[]>([]);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const depositAddress = process.env.NEXT_PUBLIC_DEPOSIT_ADDRESS;

  const load = useCallback(async () => {
    const [b, k, u] = await Promise.all([
      fetch("/api/balance").then((r) => (r.ok ? r.json() : null)),
      fetch("/api/keys").then((r) => (r.ok ? r.json() : { keys: [] })),
      fetch("/api/usage").then((r) => (r.ok ? r.json() : { items: [] })),
    ]);
    setBalance(b?.formatted ?? null);
    setKeys(k.keys ?? []);
    setUsage(u.items ?? []);
  }, []);

  useEffect(() => {
    if (isConnected) load();
  }, [isConnected, load]);

  async function createKey() {
    const r = await fetch("/api/keys", { method: "POST", body: JSON.stringify({}) });
    const data = await r.json();
    if (r.ok) {
      setNewKey(data.plaintext);
      load();
    }
  }

  async function revokeKey(id: string) {
    if (!confirm("Revoke this key? Apps using it will stop working.")) return;
    await fetch(`/api/keys/${id}`, { method: "DELETE" });
    load();
  }

  if (!isConnected) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-24 text-center">
        <Wallet className="mx-auto size-10 text-muted-foreground" />
        <h2 className="mt-4 text-xl font-semibold">Connect your wallet</h2>
        <p className="mt-2 text-muted-foreground">
          Connect a Base wallet to view your balance, generate API keys, and see your usage.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Signed in as <span className="font-mono">{shortenAddress(address ?? "")}</span>
      </p>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <Card title="Balance">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-semibold">${balance ?? "—"}</span>
            <span className="text-sm text-muted-foreground">USDC</span>
          </div>
          {depositAddress && depositAddress !== "0x0000000000000000000000000000000000000000" && (
            <div className="mt-4 rounded-md border border-border bg-muted p-3 text-xs">
              <p className="font-medium text-foreground">Top up</p>
              <p className="mt-1 text-muted-foreground">Send USDC on Base to:</p>
              <code className="mt-1 block break-all font-mono text-[11px]">{depositAddress}</code>
            </div>
          )}
        </Card>

        <Card title="API Keys" action={
          <button
            onClick={createKey}
            className="inline-flex items-center gap-1.5 rounded-md bg-[#0052ff] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#0040cc]"
          >
            <Plus className="size-3.5" /> New key
          </button>
        }>
          {newKey && (
            <div className="mb-3 rounded-md border border-[#0052ff]/40 bg-[#0052ff]/5 p-3">
              <p className="text-xs font-medium text-foreground">Copy this key now — it won't be shown again.</p>
              <div className="mt-2 flex items-center gap-2">
                <code className="flex-1 break-all rounded bg-background px-2 py-1 font-mono text-xs">{newKey}</code>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(newKey);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 1500);
                  }}
                  className="inline-flex size-7 items-center justify-center rounded-md border border-border hover:bg-muted"
                >
                  {copied ? <Check className="size-3.5 text-green-500" /> : <Copy className="size-3.5" />}
                </button>
              </div>
              <button
                onClick={() => setNewKey(null)}
                className="mt-2 text-xs text-muted-foreground hover:text-foreground"
              >
                Dismiss
              </button>
            </div>
          )}
          {keys.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">No keys yet.</p>
          ) : (
            <ul className="space-y-2">
              {keys.map((k) => (
                <li key={k.id} className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm">
                  <div>
                    <div className="font-medium">{k.name}</div>
                    <div className="font-mono text-xs text-muted-foreground">{k.prefix}…</div>
                  </div>
                  <button
                    onClick={() => revokeKey(k.id)}
                    className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-destructive"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <Card title="Recent usage" className="mt-6">
        {usage.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">No usage yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs text-muted-foreground">
                <tr>
                  <th className="py-2 pr-4 font-medium">When</th>
                  <th className="py-2 pr-4 font-medium">Model</th>
                  <th className="py-2 pr-4 font-medium">Tokens</th>
                  <th className="py-2 pr-4 font-medium">Cost</th>
                  <th className="py-2 pr-4 font-medium">Source</th>
                </tr>
              </thead>
              <tbody>
                {usage.map((u) => (
                  <tr key={u.id} className="border-t border-border">
                    <td className="py-2 pr-4 text-xs text-muted-foreground">{new Date(u.createdAt).toLocaleString()}</td>
                    <td className="py-2 pr-4 font-mono text-xs">{u.model}</td>
                    <td className="py-2 pr-4">{u.inputTokens} / {u.outputTokens}</td>
                    <td className="py-2 pr-4 font-mono text-xs">${(Number(u.costMicroUsdc) / 1_000_000).toFixed(6)}</td>
                    <td className="py-2 pr-4 text-xs text-muted-foreground">{u.source}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

function Card({
  title,
  action,
  className,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={`rounded-xl border border-border bg-card p-5 ${className ?? ""}`}>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}
