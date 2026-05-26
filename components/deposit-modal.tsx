"use client";

import { useState, useEffect } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from "wagmi";
import { parseUnits, formatUnits, erc20Abi } from "viem";
import { base } from "wagmi/chains";
import { X, Loader2, ExternalLink, Check } from "lucide-react";

// USDC on Base mainnet (6 decimals)
const USDC_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" as const;

type Tab = "deposit" | "withdraw";
type Asset = "USDC" | "SHIELD";

export function DepositModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { address, isConnected } = useAccount();
  const [tab, setTab] = useState<Tab>("deposit");
  const [asset, setAsset] = useState<Asset>("USDC");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState<string | null>(null);

  const depositAddress = process.env.NEXT_PUBLIC_DEPOSIT_ADDRESS as `0x${string}` | undefined;

  const { data: usdcBalance } = useReadContract({
    abi: erc20Abi,
    address: USDC_ADDRESS,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    chainId: base.id,
    query: { enabled: !!address && open },
  });

  const { writeContract, data: txHash, isPending, reset } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  useEffect(() => {
    if (!open) {
      setAmount("");
      setError(null);
      reset();
    }
  }, [open, reset]);

  if (!open) return null;

  const usdcBalanceFmt = usdcBalance ? formatUnits(usdcBalance, 6) : "0";

  async function handleDeposit() {
    setError(null);
    if (!depositAddress || depositAddress === "0x0000000000000000000000000000000000000000") {
      setError("Deposit address not configured");
      return;
    }
    const value = parseFloat(amount);
    if (!value || value <= 0) {
      setError("Invalid amount");
      return;
    }
    try {
      writeContract({
        abi: erc20Abi,
        address: USDC_ADDRESS,
        functionName: "transfer",
        args: [depositAddress, parseUnits(amount, 6)],
        chainId: base.id,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Transaction failed");
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className="relative w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* CLOSE BUTTON — absolute top-right, more prominent */}
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute right-4 top-4 inline-flex size-9 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition hover:bg-muted hover:text-foreground"
          >
            <X className="size-4" />
          </button>

          {/* HEADER */}
          <div className="pr-12">
            <h2 className="font-serif text-2xl">Deposit</h2>
          </div>

        {/* DEPOSIT / WITHDRAW TABS */}
        <div className="mt-5 grid grid-cols-2 gap-1 rounded-lg bg-background p-1">
          <TabPill active={tab === "deposit"} onClick={() => setTab("deposit")}>Deposit</TabPill>
          <TabPill active={tab === "withdraw"} onClick={() => setTab("withdraw")} disabled>
            Withdraw
          </TabPill>
        </div>

        {/* ASSET TABS */}
        <div className="mt-3 grid grid-cols-2 gap-1 rounded-lg bg-background p-1">
          <AssetPill active={asset === "USDC"} onClick={() => setAsset("USDC")}>USDC</AssetPill>
          <AssetPill active={asset === "SHIELD"} onClick={() => setAsset("SHIELD")} soon>
            $SHIELD
          </AssetPill>
        </div>

        {tab === "withdraw" ? (
          <div className="mt-8 py-12 text-center">
            <p className="text-sm text-muted-foreground">Withdrawals coming soon.</p>
          </div>
        ) : asset === "SHIELD" ? (
          <div className="mt-8 py-12 text-center">
            <p className="text-sm text-muted-foreground">$SHIELD token launching soon.</p>
            <p className="mt-1 text-xs text-muted-foreground">Top up with USDC for now.</p>
          </div>
        ) : !isConnected ? (
          <div className="mt-8 py-12 text-center">
            <p className="text-sm text-muted-foreground">Connect your wallet to deposit.</p>
          </div>
        ) : isConfirmed ? (
          <div className="mt-8 text-center">
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-emerald-500/10">
              <Check className="size-6 text-emerald-500" />
            </div>
            <p className="mt-4 font-semibold">Deposit sent!</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Your balance will update within ~30 seconds.
            </p>
            {txHash && (
              <a
                href={`https://basescan.org/tx/${txHash}`}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex items-center gap-1 text-xs text-[#0052ff] hover:underline"
              >
                View on Basescan <ExternalLink className="size-3" />
              </a>
            )}
            <button
              onClick={onClose}
              className="mt-6 w-full rounded-lg bg-foreground py-2.5 text-sm font-medium text-background hover:opacity-90"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <div className="mt-6">
              <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
                <span>Deposit Amount (USDC)</span>
                <button
                  onClick={() => setAmount(usdcBalanceFmt)}
                  className="font-medium text-foreground hover:underline"
                >
                  Balance: {parseFloat(usdcBalanceFmt).toFixed(2)} USDC
                </button>
              </div>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter custom amount..."
                step="0.01"
                min="0"
                disabled={isPending || isConfirming}
                className="w-full rounded-lg border border-border bg-background px-4 py-3 text-base placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#0052ff]/40 disabled:opacity-50"
              />
            </div>

            <div className="mt-3 grid grid-cols-4 gap-2">
              {["5", "10", "25", "50"].map((v) => (
                <button
                  key={v}
                  onClick={() => setAmount(v)}
                  disabled={isPending || isConfirming}
                  className="rounded-md border border-border bg-background px-2 py-1.5 text-xs hover:bg-muted disabled:opacity-50"
                >
                  ${v}
                </button>
              ))}
            </div>

            {error && (
              <div className="mt-4 rounded-md border border-destructive/40 bg-destructive/10 p-2.5 text-xs text-destructive">
                {error}
              </div>
            )}

            <button
              onClick={handleDeposit}
              disabled={isPending || isConfirming || !amount || parseFloat(amount) <= 0}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-foreground py-3 text-sm font-medium text-background hover:opacity-90 disabled:opacity-50"
            >
              {isPending && <Loader2 className="size-4 animate-spin" />}
              {isPending
                ? "Confirm in wallet…"
                : isConfirming
                ? "Confirming on Base…"
                : "Deposit"}
            </button>

            <p className="mt-3 text-center text-[11px] text-muted-foreground">
              Direct USDC deposit on Base. Charges deduct per API call.
            </p>
          </>
        )}
        </div>
      </div>
    </div>
  );
}

function TabPill({
  active,
  onClick,
  disabled,
  children,
}: {
  active: boolean;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
        active ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
      } ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
    >
      {children}
    </button>
  );
}

function AssetPill({
  active,
  onClick,
  soon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  soon?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative rounded-md px-3 py-1.5 text-sm font-medium transition ${
        active ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {children}
      {soon && (
        <span className="ml-1.5 rounded-full border border-border bg-muted px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-muted-foreground">
          Soon
        </span>
      )}
    </button>
  );
}
