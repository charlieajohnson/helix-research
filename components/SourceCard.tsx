"use client";

import { useState } from "react";
import { Badge, GlassPanel, SectionLabel } from "@/components/ui";
import type { ResearchSource } from "@/lib/types";

export function SourceCard({
  source,
  index,
}: {
  source: ResearchSource;
  index: number;
}) {
  return (
    <a
      href={source.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block"
      style={{
        animation: "fadeUp 0.4s ease-out both",
        animationDelay: `${index * 0.06}s`,
      }}
    >
      <GlassPanel variant="interactive" className="p-3.5">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 inline-flex min-w-8 items-center justify-center rounded-md border border-teal-300/35 bg-teal-300/10 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-teal-100">
            {source.citationLabel ?? `S${index + 1}`}
          </span>

          <div className="min-w-0 flex-1">
            <div className="mb-1.5 flex items-start gap-2">
              <h4 className="flex-1 truncate text-sm font-semibold text-slate-100">
                {source.title}
              </h4>
              <Badge variant={source.type === "paper" ? "paper" : "web"}>
                {source.type}
              </Badge>
            </div>

            <div className="mb-2 flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[10px] text-slate-400">
              {source.domain && <span>{source.domain}</span>}
              {source.authors && source.authors.length > 0 && (
                <span>
                  {source.authors.slice(0, 2).join(", ")}
                  {source.authors.length > 2 ? " et al." : ""}
                </span>
              )}
              <span className="ml-auto text-teal-200">{(source.score * 100).toFixed(0)}%</span>
            </div>

            <p className="line-clamp-3 text-xs leading-6 text-slate-300/95">
              {source.snippet}
            </p>
          </div>

          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            className="mt-1 shrink-0 text-slate-500"
          >
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
        </div>
      </GlassPanel>
    </a>
  );
}

export function SourceList({ sources }: { sources: ResearchSource[] }) {
  const [expanded, setExpanded] = useState(false);

  if (sources.length === 0) return null;

  return (
    <GlassPanel variant="muted" className="p-3.5">
      <button
        onClick={() => setExpanded((value) => !value)}
        className="flex w-full items-center justify-between gap-2"
        aria-expanded={expanded}
      >
        <div className="flex items-center gap-2">
          <SectionLabel>Sources Analyzed</SectionLabel>
          <span className="font-mono text-xs text-slate-400">{sources.length} sources</span>
        </div>
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={`text-slate-400 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      <div className="accordion-content" data-open={expanded}>
        <div className="accordion-inner">
          <div className="mt-3 space-y-2.5">
            {sources.map((source, i) => (
              <SourceCard key={source.id} source={source} index={i} />
            ))}
          </div>
        </div>
      </div>
    </GlassPanel>
  );
}
