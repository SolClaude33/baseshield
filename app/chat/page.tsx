"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAccount } from "wagmi";
import { ArrowUp, Loader2, Paperclip, Wrench, Mic, Sparkles } from "lucide-react";
import { MODELS, DEFAULT_MODEL, type ModelId } from "@/lib/llm/pricing";
import { BaseToolsModal } from "@/components/base-tools-modal";

type Msg = { role: "user" | "assistant"; content: string; model?: ModelId };

export default function ChatPage() {
  return (
    <Suspense>
      <ChatInner />
    </Suspense>
  );
}

function ChatInner() {
  const { isConnected } = useAccount();
  const searchParams = useSearchParams();
  const initialModel = (searchParams.get("model") as ModelId) || DEFAULT_MODEL;
  const initialQuery = searchParams.get("q") ?? "";
  const isSelectable = (m: ModelId | string): m is ModelId => m in MODELS && !MODELS[m as ModelId].soon;
  const [model, setModel] = useState<ModelId>(isSelectable(initialModel) ? initialModel : DEFAULT_MODEL);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState(initialQuery);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toolsOpen, setToolsOpen] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, busy]);

  async function send() {
    if (!input.trim() || busy) return;
    setError(null);
    const userMsg: Msg = { role: "user", content: input.trim() };
    const next: Msg[] = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setBusy(true);
    try {
      const r = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model,
          messages: next.map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await r.json();
      if (!r.ok) {
        setError(data.error ?? "request failed");
      } else {
        setMessages([...next, { role: "assistant", content: data.message, model }]);
      }
    } catch {
      setError("network error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="relative mx-auto flex h-[calc(100vh-4rem)] max-w-3xl flex-col px-4 md:px-6">
      {/* MESSAGES */}
      <div className="flex-1 overflow-y-auto pb-48 pt-10">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center text-muted-foreground">
            <p className="font-serif italic text-3xl text-foreground/80">How can I help you today?</p>
            {!isConnected && (
              <p className="mt-3 text-sm">Connect your wallet to start a private conversation.</p>
            )}
          </div>
        ) : (
          <div className="space-y-8">
            {messages.map((m, i) =>
              m.role === "user" ? (
                <div key={i} className="flex justify-end">
                  <div className="max-w-[80%] whitespace-pre-wrap rounded-2xl bg-card border border-border px-4 py-2.5 text-sm">
                    {m.content}
                  </div>
                </div>
              ) : (
                <div key={i} className="space-y-3">
                  <div className="whitespace-pre-wrap text-[15px] leading-relaxed text-foreground/95">
                    {m.content}
                  </div>
                  {m.model && (
                    <div className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-2 py-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                      <Sparkles className="size-3" />
                      {MODELS[m.model].label}
                    </div>
                  )}
                </div>
              ),
            )}
            {busy && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="size-4 animate-spin" />
                <span className="text-sm">Thinking…</span>
              </div>
            )}
            <div ref={endRef} />
          </div>
        )}
      </div>

      {/* BOTTOM INPUT */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background via-background to-transparent px-4 pb-6 pt-6 md:px-6">
        <div className="mx-auto max-w-3xl">
          {error && (
            <div className="mb-3 rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}

          <p className="mb-3 text-center text-[11px] text-muted-foreground">
            {isConnected ? "End-to-end secured · pay-per-call in USDC" : "Connect wallet to start"}
          </p>

          <div className="rounded-2xl border border-border bg-card shadow-2xl shadow-[#0052ff]/5">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              placeholder="How can I help you today?"
              rows={2}
              disabled={!isConnected || busy}
              className="w-full resize-none rounded-2xl bg-transparent px-5 py-4 text-base placeholder:text-muted-foreground focus:outline-none disabled:opacity-50"
            />
            <div className="flex items-center justify-between gap-2 px-3 pb-3">
              <div className="flex items-center gap-1">
                <IconButton title="Attach (soon)" disabled>
                  <Paperclip className="size-4" />
                </IconButton>
                <IconButton title="Base Tools" onClick={() => setToolsOpen(true)}>
                  <Wrench className="size-4" />
                </IconButton>
              </div>
              <div className="flex items-center gap-2">
                <div className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2 py-1 text-xs text-muted-foreground">
                  <Sparkles className="size-3 text-[#0052ff]" />
                  <select
                    value={model}
                    onChange={(e) => setModel(e.target.value as ModelId)}
                    className="bg-transparent focus:outline-none"
                  >
                    {Object.entries(MODELS).map(([id, m]) => (
                      <option key={id} value={id} disabled={m.soon} className="bg-background text-foreground">
                        {m.label}{m.soon ? " (Soon)" : ""}
                      </option>
                    ))}
                  </select>
                </div>
                <IconButton title="Voice (soon)" disabled>
                  <Mic className="size-4" />
                </IconButton>
                <button
                  onClick={send}
                  disabled={!isConnected || busy || !input.trim()}
                  className="inline-flex size-9 items-center justify-center rounded-lg bg-[#0052ff] text-white hover:bg-[#0040cc] transition disabled:opacity-40"
                >
                  <ArrowUp className="size-4" />
                </button>
              </div>
            </div>
          </div>

          <p className="mt-3 text-center text-[10px] text-muted-foreground">
            <kbd className="rounded border border-border bg-muted px-1 py-0.5 font-mono">Enter</kbd>
            <span className="mx-1.5">to send</span>·
            <kbd className="ml-1.5 rounded border border-border bg-muted px-1 py-0.5 font-mono">Shift+Enter</kbd>
            <span className="ml-1.5">new line</span>
          </p>
        </div>
      </div>

      <BaseToolsModal open={toolsOpen} onClose={() => setToolsOpen(false)} />
    </div>
  );
}

function IconButton({
  children,
  onClick,
  disabled,
  title,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  title?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
    >
      {children}
    </button>
  );
}
