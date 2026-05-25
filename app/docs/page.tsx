import fs from "node:fs/promises";
import path from "node:path";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Docs — BaseShield",
  description: "Reference, SDK, and the verifiable privacy architecture.",
};

export default async function DocsPage() {
  const content = await fs.readFile(path.join(process.cwd(), "docs", "README.md"), "utf8");

  return (
    <div className="mx-auto max-w-3xl px-6 py-20 md:py-28">
      {/* HEADER */}
      <header className="mb-20">
        <h1 className="font-serif italic text-6xl md:text-7xl leading-[0.95] tracking-tight">
          BaseShield Docs.
        </h1>
        <p className="mt-6 max-w-xl text-sm md:text-base text-muted-foreground leading-relaxed">
          Reference, SDK, and the verifiable privacy architecture — everything you need to build with BaseShield.
        </p>
      </header>

      {/* SECTION 01 */}
      <div className="mb-10 flex items-center gap-4">
        <span className="font-mono text-xs text-muted-foreground">01</span>
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Developer</span>
        <span className="h-px flex-1 bg-border" />
      </div>

      <article className="docs-content">
        <Markdown
          remarkPlugins={[remarkGfm]}
          components={{
            h1: ({ children }) => (
              <h2 className="font-serif text-4xl md:text-5xl tracking-tight mt-4 mb-2">{children}</h2>
            ),
            h2: ({ children }) => (
              <h3 className="font-serif text-2xl md:text-3xl tracking-tight mt-14 mb-4">{children}</h3>
            ),
            h3: ({ children }) => (
              <h4 className="text-lg md:text-xl font-semibold mt-10 mb-3">{children}</h4>
            ),
            h4: ({ children }) => (
              <h5 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mt-6 mb-2">{children}</h5>
            ),
            p: ({ children }) => (
              <p className="text-[15px] text-foreground/80 leading-relaxed my-4">{children}</p>
            ),
            ul: ({ children }) => (
              <ul className="my-4 space-y-1.5 pl-5 text-[15px] text-foreground/80 [&>li]:list-disc [&>li]:marker:text-muted-foreground">{children}</ul>
            ),
            ol: ({ children }) => (
              <ol className="my-4 space-y-1.5 pl-5 text-[15px] text-foreground/80 [&>li]:list-decimal">{children}</ol>
            ),
            a: ({ href, children }) => (
              <a href={href} className="text-[#0052ff] underline decoration-[#0052ff]/30 underline-offset-4 hover:decoration-[#0052ff]">
                {children}
              </a>
            ),
            strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
            blockquote: ({ children }) => (
              <blockquote className="my-6 border-l-2 border-[#0052ff] pl-4 text-foreground/70 italic">{children}</blockquote>
            ),
            code: ({ children, className }) => {
              if (className) {
                return <code className={className}>{children}</code>;
              }
              return (
                <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.85em] text-foreground">
                  {children}
                </code>
              );
            },
            pre: ({ children }) => (
              <pre className="my-6 overflow-x-auto rounded-xl border border-border bg-card p-5 font-mono text-xs leading-relaxed">
                {children}
              </pre>
            ),
            table: ({ children }) => (
              <div className="my-6 overflow-x-auto">
                <table className="w-full border-collapse text-sm">{children}</table>
              </div>
            ),
            thead: ({ children }) => <thead className="border-b border-border">{children}</thead>,
            th: ({ children }) => (
              <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {children}
              </th>
            ),
            td: ({ children }) => (
              <td className="border-b border-border/50 px-3 py-2 text-foreground/80">{children}</td>
            ),
            hr: () => <hr className="my-12 border-border" />,
          }}
        >
          {content}
        </Markdown>
      </article>

      <footer className="mt-24 border-t border-border pt-8 text-center text-xs text-muted-foreground">
        Built with privacy, powered by Base · Phala · Railgun.
      </footer>
    </div>
  );
}
