import type { ReactNode } from "react";
import { SectionLabel } from "@/components/ui";
import type { ResearchOutput, ResearchSource } from "@/lib/types";

export function SynthesisPanel({
  output,
  sources,
}: {
  output: ResearchOutput;
  sources: ResearchSource[];
}) {
  const sourceByLabel = new Map(
    sources.filter((source) => source.citationLabel).map((source) => [source.citationLabel!, source])
  );

  return (
    <div className="space-y-12" style={{ animation: "fadeUp 0.45s ease-out both" }}>
      <section aria-labelledby="executive-read-title">
        <SectionLabel>Executive read</SectionLabel>
        <h2 id="executive-read-title" className="mt-3 font-heading text-[clamp(1.875rem,2.4vw,2.5rem)] font-medium leading-[1.02] tracking-[-0.035em] text-[color:var(--paper)]">
          What the evidence says.
        </h2>
        <div className="mt-6 max-w-[68ch] space-y-5 text-[15px] leading-[1.75] text-[color:var(--paper-muted)] [overflow-wrap:anywhere]">
          {splitParagraphs(output.summary).map((paragraph, index) => (
            <p key={index}>{renderInline(paragraph, sourceByLabel)}</p>
          ))}
        </div>
      </section>

      {output.keyFindings.length > 0 && (
        <section aria-labelledby="findings-title">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[color:var(--rule-strong)] pb-4">
            <div>
              <SectionLabel>Findings</SectionLabel>
              <h2 id="findings-title" className="mt-2 font-heading text-2xl font-medium leading-[1.05] tracking-[-0.03em] text-[color:var(--paper)] sm:text-[1.75rem]">The decision record.</h2>
            </div>
            <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-[color:var(--paper-faint)]">{output.keyFindings.length} claims</span>
          </div>
          <ol>
            {output.keyFindings.map((finding, index) => (
              <li key={index} className="grid grid-cols-[2.25rem_minmax(0,1fr)] gap-4 border-b border-[color:var(--rule)] py-6 [overflow-wrap:anywhere]">
                <span className="font-mono text-[9px] text-[color:var(--signal)]">0{index + 1}</span>
                <p className="text-sm leading-6 text-[color:var(--paper-muted)]">{renderInline(finding, sourceByLabel)}</p>
              </li>
            ))}
          </ol>
        </section>
      )}

      <div className="grid gap-10 md:grid-cols-2">
        <ResearchList
          eyebrow="Open questions"
          title="What remains unresolved."
          items={output.openQuestions}
        />
        <ResearchList
          eyebrow="Limits"
          title="Where the brief stops."
          items={output.limitations}
        />
      </div>
    </div>
  );
}

function ResearchList({ eyebrow, title, items }: { eyebrow: string; title: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <section>
      <SectionLabel>{eyebrow}</SectionLabel>
      <h2 className="mt-2 font-heading text-2xl font-medium leading-[1.05] tracking-[-0.03em] text-[color:var(--paper)] sm:text-[1.75rem]">{title}</h2>
      <ul className="mt-5 border-t border-[color:var(--rule-strong)]">
        {items.map((item, index) => (
          <li key={index} className="grid grid-cols-[1.5rem_minmax(0,1fr)] gap-3 border-b border-[color:var(--rule)] py-4 text-sm leading-6 text-[color:var(--paper-muted)] [overflow-wrap:anywhere]">
            <span className="font-mono text-[9px] text-[color:var(--signal)]">{String(index + 1).padStart(2, "0")}</span>
            <span>{cleanMarkdown(item)}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function splitParagraphs(text: string) {
  return text.split(/\n{2,}/).map((part) => part.trim()).filter(Boolean);
}

function renderInline(text: string, sources: Map<string, ResearchSource>): ReactNode {
  const parts = text.split(/(\[S\d+\]|\*\*[^*]+\*\*)/g);
  return parts.map((part, index) => {
    if (/^\[S\d+\]$/.test(part)) {
      const source = sources.get(part);
      if (!source) return part;
      return (
        <a
          key={`${part}-${index}`}
          href={`#source-${source.id}`}
          className="mx-1 inline-flex min-h-6 items-center border border-[color:var(--signal)] px-1.5 font-mono text-[9px] font-semibold text-[color:var(--signal)] transition-colors hover:bg-[color:var(--signal)] hover:text-[color:var(--ink)]"
          aria-label={`${part}: jump to ${source.title}`}
        >
          {part}
        </a>
      );
    }
    if (/^\*\*[^*]+\*\*$/.test(part)) {
      return <strong key={index} className="font-semibold text-[color:var(--paper)]">{part.slice(2, -2)}</strong>;
    }
    return cleanMarkdown(part);
  });
}

function cleanMarkdown(value: string) {
  return value.replace(/^#{1,6}\s+/g, "").replace(/`/g, "");
}
