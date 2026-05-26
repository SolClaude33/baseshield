"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useAccount } from "wagmi";
import { X, Wallet, ArrowLeftRight, Rocket, Landmark, TrendingUp, DollarSign } from "lucide-react";

const TOOLS = [
  { icon: <Wallet className="size-6" />, label: "Portfolio Balance", color: "from-amber-500/20 to-amber-700/10" },
  { icon: <ArrowLeftRight className="size-6" />, label: "Swap Tokens", color: "from-[#0052ff]/30 to-[#0052ff]/10" },
  { icon: <Rocket className="size-6" />, label: "Launch Token", color: "from-rose-500/20 to-rose-700/10" },
  { icon: <Landmark className="size-6" />, label: "Stake ETH", color: "from-slate-500/20 to-slate-700/10" },
  { icon: <TrendingUp className="size-6" />, label: "Trending Tokens", color: "from-violet-500/20 to-violet-700/10" },
  { icon: <DollarSign className="size-6" />, label: "Token Price", color: "from-emerald-500/20 to-emerald-700/10" },
];

export function BaseToolsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { isConnected } = useAccount();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  if (!open || !mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <h2 className="font-serif text-2xl">Base Tools</h2>
          <button
            onClick={onClose}
            className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="mt-1 flex items-center gap-2 border-b border-border pb-4 text-xs italic">
          <span className={`size-1.5 rounded-full ${isConnected ? "bg-emerald-500" : "bg-amber-400"}`} />
          <span className="text-muted-foreground">{isConnected ? "Wallet connected" : "No wallet connected"}</span>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          {TOOLS.map((t) => (
            <button
              key={t.label}
              disabled
              className="group relative flex flex-col items-center justify-center gap-3 rounded-xl border border-border bg-background p-5 text-center transition disabled:cursor-not-allowed disabled:opacity-90"
            >
              <span className="absolute right-2 top-2 rounded-full border border-border bg-card px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wider text-muted-foreground">
                Soon
              </span>
              <div className={`flex size-12 items-center justify-center rounded-lg bg-gradient-to-br ${t.color} text-foreground`}>
                {t.icon}
              </div>
              <span className="text-sm font-medium">{t.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>,
    document.body,
  );
}
