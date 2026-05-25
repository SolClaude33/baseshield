"use client";

import Image from "next/image";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function Logo({ className = "h-10 w-auto", priority = false }: { className?: string; priority?: boolean }) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const src = !mounted ? "/logo-dark.png" : resolvedTheme === "dark" ? "/logo-dark.png" : "/logo-light.png";

  return (
    <Image
      src={src}
      alt="BaseShield"
      width={400}
      height={400}
      priority={priority}
      className={className}
    />
  );
}
