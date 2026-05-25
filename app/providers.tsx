"use client";

import { type ReactNode } from "react";
import dynamic from "next/dynamic";
import { ThemeProvider } from "next-themes";

const ClientProviders = dynamic(() => import("./client-providers"), { ssr: false });

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <ClientProviders>{children}</ClientProviders>
    </ThemeProvider>
  );
}
