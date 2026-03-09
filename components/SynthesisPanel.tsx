"use client";

import { GlassPanel, SectionLabel } from "@/components/ui";
import type { ResearchOutput } from "@/lib/types";

export function SynthesisPanel({ output }: { output: ResearchOutput }) {
  return (
    <div
      style={{
        animation: "fadeUp 0.5s ease-out both",
        animationDelay: "0.1s",
      }}
    >
      {/* Summary */}
      <GlassPanel bright className="p-5 mb-4">
        <h3 className="font-heading text-lg font-semibold text-white mb-3 leading-snug">
          Research Findings
        </h3>
        <div className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
          {highlightCitations(output.summary)}
        </div>
      </GlassPanel>

      {/* Key Findings */}
      {output.keyFindings.length > 0 && (
        <div className="mb-4">
          <SectionLabel>Key Findings</SectionLabel>
          <div className="mt-2 space-y-2">
            {output.keyFindings.map((finding, i) => (
              <GlassPanel key={i} className="p-3 flex gap-3">
                <span className="font-mono text-xs text-teal-400 font-medium flex-shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {highlightCitations(finding)}
                </p>
              </GlassPanel>
            ))}
          </div>
        </div>
      )}

      {/* Open Questions */}
      {output.openQuestions.length > 0 && (
        <div className="mb-4">
          <SectionLabel>Open Questions</SectionLabel>
          <div className="mt-2 space-y-1.5">
            {output.openQuestions.map((q, i) => (
              <div key={i} className="flex gap-2 text-sm text-slate-400">
                <span className="text-amber-500/60">?</span>
                <span>{q}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Limitations */}
      {output.limitations.length > 0 && (
        <div>
          <SectionLabel>Limitations</SectionLabel>
          <div className="mt-2 space-y-1.5">
            {output.limitations.map((l, i) => (
              <div key={i} className="flex gap-2 text-sm text-slate-500">
                <span className="text-slate-600">—</span>
                <span>{l}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Highlight [S1], [S2], etc. as styled inline badges
function highlightCitations(text: string): React.ReactNode {
  const parts = text.split(/(\[S\d+\])/g);
  return parts.map((part, i) => {
    if (/\[S\d+\]/.test(part)) {
      return (
        <span
          key={i}
          className="inline-flex items-center px-1 py-0 font-mono text-[10px] font-medium text-teal-400 bg-teal-500/10 rounded mx-0.5"
        >
          {part}
        </span>
      );
    }
    return part;
  });
}
