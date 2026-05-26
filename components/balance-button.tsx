"use client";

import { useEffect, useState, useCallback } from "react";
import { useAccount } from "wagmi";
import { Wallet } from "lucide-react";
import { DepositModal } from "./deposit-modal";

export function BalanceButton() {
  const { isConnected } = useAccount();
  const [open, setOpen] = useState(false);
  const [balance, setBalance] = useState<string | null>(null);

  const loadBalance = useCallback(async () => {
    try {
      const r = await fetch("/api/balance");
      if (r.ok) {
        const data = await r.json();
        setBalance(data.formatted);
      } else {
        setBalance(null);
      }
    } catch {
      setBalance(null);
    }
  }, []);

  useEffect(() => {
    if (isConnected) {
      loadBalance();
      const interval = setInterval(loadBalance, 15000); // refresh every 15s
      return () => clearInterval(interval);
    } else {
      setBalance(null);
    }
  }, [isConnected, loadBalance]);

  // Reload on modal close (e.g. just after a deposit)
  useEffect(() => {
    if (!open && isConnected) loadBalance();
  }, [open, isConnected, loadBalance]);

  if (!isConnected) return null;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="hidden md:inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 text-sm hover:bg-muted transition"
      >
        <Wallet className="size-4 text-muted-foreground" />
        <span className="font-mono text-xs">
          ${balance ?? "0.0000"}
        </span>
        <span className="rounded bg-foreground px-2 py-0.5 text-[11px] font-medium text-background">
          Top Up
        </span>
      </button>
      <DepositModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
