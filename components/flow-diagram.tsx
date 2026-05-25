import { DotIcon } from "./dot-icon";

export function FlowDiagram() {
  return (
    <div className="relative w-full">
      <div className="mb-10 flex justify-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-[#0052ff]/40 bg-[#0052ff]/10 px-3 py-1 text-xs font-medium text-[#0052ff]">
          <span className="size-1.5 rounded-full bg-[#0052ff]" />
          Powered by Phala TEE (Intel TDX)
        </span>
      </div>

      <div className="flex items-center justify-center gap-2 md:gap-4">
        <Node label="You" sublabel="Plaintext" iconName="person" />

        <FlowLine />

        <div className="relative rounded-2xl border border-border bg-card p-4 md:p-6">
          <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-[#0052ff]/40 bg-background px-3 py-0.5 text-[10px] font-medium uppercase tracking-wider text-[#0052ff]">
            BaseShield Infrastructure
          </span>
          <div className="flex items-start gap-3 md:gap-6">
            <Step label="Encrypt" sublabel="Client-side libsodium sealed-box" iconName="lock" />
            <Step label="TEE Process" sublabel="Hardware-isolated execution in Intel TDX" iconName="cpu" />
            <Step label="Attest" sublabel="Verifiable privacy proof published on Base" iconName="square" />
          </div>
        </div>

        <FlowLine />

        <Node label="AI" sublabel="Provider" iconName="smile" />
      </div>

      <p className="mt-12 text-center font-serif italic text-base text-muted-foreground md:text-lg">
        Zero knowledge. End-to-end encrypted. Verifiable on chain.
      </p>
    </div>
  );
}

function Node({ label, sublabel, iconName }: { label: string; sublabel: string; iconName: "person" | "smile" }) {
  return (
    <div className="flex w-20 flex-col items-center md:w-28">
      <div className="flex size-16 items-center justify-center rounded-xl border border-border bg-card md:size-20">
        <DotIcon name={iconName} size="md" tone="muted" />
      </div>
      <div className="mt-3 text-center">
        <div className="text-sm font-semibold">{label}</div>
        <div className="text-[11px] text-muted-foreground">{sublabel}</div>
      </div>
    </div>
  );
}

function Step({ label, sublabel, iconName }: { label: string; sublabel: string; iconName: "lock" | "cpu" | "square" }) {
  return (
    <div className="flex w-28 flex-col items-center md:w-32">
      <div className="flex size-12 items-center justify-center rounded-lg bg-background md:size-14">
        <DotIcon name={iconName} size="sm" tone="primary" />
      </div>
      <div className="mt-3 text-center">
        <div className="text-xs font-semibold md:text-sm">{label}</div>
        <div className="mt-0.5 text-[10px] leading-snug text-muted-foreground md:text-[11px]">{sublabel}</div>
      </div>
    </div>
  );
}

function FlowLine() {
  return (
    <div className="relative hidden h-px flex-1 max-w-[120px] md:block">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-border to-transparent" />
      <div className="flow-dot absolute top-1/2 -translate-y-1/2" />
      <div className="flow-dot flow-dot-delayed absolute top-1/2 -translate-y-1/2" />
    </div>
  );
}
