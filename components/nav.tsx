"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "./logo";
import { WalletButton } from "./wallet-button";
import { ThemeToggle } from "./theme-toggle";
import { BalanceButton } from "./balance-button";
import { cn } from "@/lib/utils";

const links = [
  { href: "/chat", label: "Chat" },
  { href: "/agent", label: "Agent" },
  { href: "/sdk", label: "SDK" },
  { href: "/docs", label: "Docs" },
];

export function Nav() {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <Logo className="h-10 w-auto" priority />
          <span className="text-base font-semibold tracking-tight">BaseShield</span>
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground",
                pathname?.startsWith(l.href) && "bg-muted text-foreground",
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <BalanceButton />
          <a
            href="https://x.com/BaseShieldPriv"
            target="_blank"
            rel="noreferrer"
            aria-label="X (Twitter)"
            className="inline-flex size-9 items-center justify-center rounded-md border border-border bg-card text-muted-foreground transition hover:bg-muted hover:text-foreground"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="size-3.5">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </a>
          <ThemeToggle />
          <WalletButton />
        </div>
      </div>
    </header>
  );
}
