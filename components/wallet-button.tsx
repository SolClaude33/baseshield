"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useSignMessage, useDisconnect } from "wagmi";
import { useEffect, useRef, useState, useCallback } from "react";
import { SiweMessage } from "siwe";

export function WalletButton() {
  const { address, isConnected, chain } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const { disconnect } = useDisconnect();
  const [authedAddress, setAuthedAddress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const attemptedRef = useRef<string | null>(null);

  // Reset attempt tracking when wallet disconnects
  useEffect(() => {
    if (!isConnected) {
      attemptedRef.current = null;
      setError(null);
    }
  }, [isConnected]);

  // Load current session once on mount
  useEffect(() => {
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((d) => setAuthedAddress(d.walletAddress ?? null))
      .catch(() => setAuthedAddress(null));
  }, []);

  const runSiwe = useCallback(async () => {
    if (!address || !chain) return;
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const nonceRes = await fetch("/api/auth/nonce").then((r) => r.json());
      const message = new SiweMessage({
        domain: window.location.host,
        address,
        statement: "Sign in to BaseShield.",
        uri: window.location.origin,
        version: "1",
        chainId: chain.id,
        nonce: nonceRes.nonce,
      });
      const prepared = message.prepareMessage();
      const signature = await signMessageAsync({ message: prepared });
      const verify = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: prepared, signature }),
      });
      if (verify.ok) {
        setAuthedAddress(address);
      } else {
        const body = await verify.json().catch(() => ({}));
        setError(body.error ?? `verify failed (${verify.status})`);
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "sign-in failed";
      setError(/reject/i.test(msg) ? "Signature rejected" : msg);
    } finally {
      setBusy(false);
    }
  }, [address, chain, busy, signMessageAsync]);

  // Auto-trigger SIWE exactly ONCE per address. Never auto-retry after failure.
  useEffect(() => {
    if (!isConnected || !address) return;
    if (authedAddress?.toLowerCase() === address.toLowerCase()) return;
    if (attemptedRef.current === address.toLowerCase()) return;
    attemptedRef.current = address.toLowerCase();
    runSiwe();
  }, [isConnected, address, authedAddress, runSiwe]);

  return (
    <div className="flex items-center gap-2">
      {error && isConnected && (
        <div className="hidden md:flex items-center gap-2 rounded-md border border-destructive/40 bg-destructive/10 px-2 py-1 text-[11px] text-destructive">
          <span>{error}</span>
          <button
            onClick={() => {
              attemptedRef.current = null;
              runSiwe();
            }}
            className="font-medium underline"
            disabled={busy}
          >
            Retry
          </button>
          <button
            onClick={() => {
              attemptedRef.current = null;
              disconnect();
            }}
            className="text-muted-foreground hover:text-foreground"
          >
            ✕
          </button>
        </div>
      )}
      <ConnectButton showBalance={false} chainStatus="icon" />
    </div>
  );
}
