import { Badge, SectionLabel } from "@/components/ui";
import type { ResearchSource } from "@/lib/types";

export function SourceCard({ source, index }: { source: ResearchSource; index: number }) {
  return (
    <article id={`source-${source.id}`} className="scroll-mt-6 border-t border-[color:var(--rule)] py-5 [overflow-wrap:anywhere] first:border-t-0 first:pt-0">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-[color:var(--signal)]">
          {source.citationLabel ?? `[S${index + 1}]`}
        </span>
        <Badge variant={source.type === "paper" ? "paper" : "web"}>{source.type}</Badge>
      </div>
      <h3 className="mt-3 text-sm font-semibold leading-6 text-[color:var(--paper)]">{source.title}</h3>
      <div className="mt-2 flex min-w-0 flex-wrap gap-x-3 gap-y-1 font-mono text-[8px] uppercase tracking-[0.08em] text-[color:var(--paper-faint)] [overflow-wrap:anywhere]">
        {source.domain && <span>{source.domain}</span>}
        {source.publishedAt && <span>{formatDate(source.publishedAt)}</span>}
        {source.authors && source.authors.length > 0 && <span>{source.authors.slice(0, 2).join(", ")}</span>}
      </div>
      <p className="mt-3 line-clamp-4 text-xs leading-5 text-[color:var(--paper-muted)]">{cleanSnippet(source.snippet)}</p>
      <a
        href={source.url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 inline-flex min-h-11 items-center border-b border-[color:var(--rule)] font-mono text-[9px] uppercase tracking-[0.12em] text-[color:var(--paper-muted)] transition-colors hover:border-[color:var(--signal)] hover:text-[color:var(--paper)]"
        aria-label={`Open source: ${source.title}`}
      >
        Open source <span className="ml-2 text-[color:var(--signal)]" aria-hidden="true">↗</span>
      </a>
    </article>
  );
}

export function SourceList({ sources }: { sources: ResearchSource[] }) {
  return (
    <section aria-labelledby="evidence-ledger-title">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <SectionLabel>Evidence ledger</SectionLabel>
          <h2 id="evidence-ledger-title" className="mt-2 font-heading text-2xl font-medium leading-[1.05] tracking-[-0.03em] text-[color:var(--paper)] sm:text-[1.75rem]">
            Linked sources
          </h2>
        </div>
        <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-[color:var(--paper-faint)]">{sources.length} total</span>
      </div>
      {sources.length > 0 ? (
        <div>
          {sources.map((source, index) => <SourceCard key={source.id} source={source} index={index} />)}
        </div>
      ) : (
        <p className="border-t border-[color:var(--rule)] py-5 text-sm leading-6 text-[color:var(--paper-muted)]">Sources will appear here as the search completes.</p>
      )}
    </section>
  );
}

function cleanSnippet(snippet: string) {
  return snippet.replace(/\s+/g, " ").replace(/[#*_`]/g, "").trim();
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-GB", { month: "short", year: "numeric" }).format(date);
}
