"use client";

import { GlassPanel, Badge } from "@/components/ui";
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
      className="block group"
      style={{
        animation: "fadeUp 0.4s ease-out both",
        animationDelay: `${index * 0.08}s`,
      }}
    >
      <GlassPanel className="p-3 hover:border-slate-600/30 transition-all cursor-pointer">
        <div className="flex items-start gap-2">
          {/* Citation label */}
          <span className="font-mono text-[10px] font-medium text-teal-400 bg-teal-500/10 px-1.5 py-0.5 rounded flex-shrink-0 mt-0.5">
            {source.citationLabel ?? `S${index + 1}`}
          </span>

          <div className="flex-1 min-w-0">
            {/* Title + type badge */}
            <div className="flex items-start gap-2 mb-1">
              <h4 className="text-sm font-medium text-slate-200 group-hover:text-white transition-colors line-clamp-1 flex-1">
                {source.title}
              </h4>
              <Badge variant={source.type === "paper" ? "paper" : "web"}>
                {source.type}
              </Badge>
            </div>

            {/* Domain + score */}
            <div className="flex items-center gap-2 mb-1.5">
              {source.domain && (
                <span className="font-mono text-[10px] text-slate-500">
                  {source.domain}
                </span>
              )}
              {source.authors && source.authors.length > 0 && (
                <span className="font-mono text-[10px] text-slate-500">
                  {source.authors.slice(0, 2).join(", ")}
                  {source.authors.length > 2 ? " et al." : ""}
                </span>
              )}
              <span className="font-mono text-[10px] text-teal-400/70 ml-auto">
                {(source.score * 100).toFixed(0)}%
              </span>
            </div>

            {/* Snippet */}
            <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
              {source.snippet}
            </p>
          </div>

          {/* Link-out icon */}
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="text-slate-600 group-hover:text-slate-400 transition-colors flex-shrink-0 mt-1"
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
  if (sources.length === 0) return null;

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-slate-500">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
        </svg>
        <span className="font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-slate-500">
          Sources Analyzed
        </span>
      </div>

      <div className="flex items-center gap-4 mb-4">
        <GlassPanel className="px-3 py-2 flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-slate-400">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
          <span className="text-lg font-heading font-semibold text-white">{sources.length}</span>
          <span className="text-xs text-slate-400">Relevant Sources</span>
        </GlassPanel>
      </div>

      <div className="space-y-2">
        {sources.map((source, i) => (
          <SourceCard key={source.id} source={source} index={i} />
        ))}
      </div>
    </div>
  );
}
