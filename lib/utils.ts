import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function shortenAddress(address: string, chars = 4): string {
  if (!address) return "";
  return `${address.slice(0, chars + 2)}…${address.slice(-chars)}`;
}

export function formatUsdc(microUsdc: bigint | number): string {
  const n = typeof microUsdc === "bigint" ? Number(microUsdc) : microUsdc;
  return (n / 1_000_000).toFixed(4);
}
