"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowUp, Sparkles, Lock } from "lucide-react";
import { MODELS, DEFAULT_MODEL, type ModelId } from "@/lib/llm/pricing";

export function HeroChatInput() {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [model, setModel] = useState<ModelId>(DEFAULT_MODEL);

  function submit() {
    if (!value.trim()) {
      router.push("/chat");
      return;
    }
    const params = new URLSearchParams({ q: value.trim(), model });
    router.push(`/chat?${params.toString()}`);
  }

  return (
    <div className="rounded-2xl border border-border bg-card/80 backdrop-blur p-3 shadow-2xl shadow-[#0052ff]/5">
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            submit();
          }
        }}
        placeholder="Ask anything privately…"
        rows={2}
        className="w-full resize-none bg-transparent px-3 py-2 text-base placeholder:text-muted-foreground focus:outline-none"
      />
      <div className="mt-1 flex items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2 py-1 text-xs text-muted-foreground">
            <Sparkles className="size-3" />
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
          <span className="hidden items-center gap-1.5 text-xs text-muted-foreground md:inline-flex">
            <Lock className="size-3" />
            Encrypted
          </span>
        </div>
        <button
          onClick={submit}
          className="inline-flex size-9 items-center justify-center rounded-lg bg-[#0052ff] text-white hover:bg-[#0040cc] transition"
        >
          <ArrowUp className="size-4" />
        </button>
      </div>
    </div>
  );
}
