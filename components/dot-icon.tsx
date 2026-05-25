/* Dot-matrix icon rendered from a 7x7 binary string ("X.X..."). Used in the E2E flow visual. */

const PATTERNS: Record<string, string> = {
  // 7x7, rows separated by |. "X" = on, "." = off.
  person: ".XXXXX.|X.....X|X.X.X.X|X.....X|X.XXX.X|X.....X|.XXXXX.",
  lock:   "..XXX..|.X...X.|.X...X.|XXXXXXX|X.X.X.X|X.X.X.X|XXXXXXX",
  cpu:    "X.X.X.X|.XXXXX.|X.XXX.X|.XXXXX.|X.XXX.X|.XXXXX.|X.X.X.X",
  square: "XXXXXXX|X.....X|X.XXX.X|X.X.X.X|X.XXX.X|X.....X|XXXXXXX",
  smile:  ".XXXXX.|X.....X|X.X.X.X|X.....X|X.X.X.X|X..X..X|.XXXXX.",
};

export function DotIcon({
  name,
  size = "md",
  tone = "primary",
}: {
  name: keyof typeof PATTERNS;
  size?: "sm" | "md" | "lg";
  tone?: "primary" | "muted";
}) {
  const pattern = PATTERNS[name];
  const cells = pattern.split("|").flatMap((row) => row.split(""));
  const dotSize = size === "sm" ? "size-[3px]" : size === "lg" ? "size-2" : "size-1.5";
  const gap = size === "sm" ? "gap-[2px]" : size === "lg" ? "gap-1.5" : "gap-1";
  const onColor = tone === "primary" ? "bg-[#0052ff]" : "bg-foreground/70";

  return (
    <div className={`grid grid-cols-7 ${gap}`}>
      {cells.map((c, i) => (
        <div
          key={i}
          className={`${dotSize} rounded-full ${c === "X" ? onColor : "bg-foreground/10"}`}
        />
      ))}
    </div>
  );
}
