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
          <ThemeToggle />
          <WalletButton />
        </div>
      </div>
    </header>
  );
}
