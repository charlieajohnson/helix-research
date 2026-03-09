"use client";

import { useState, type ReactNode } from "react";
import { GlassPanel, SectionLabel } from "@/components/ui";
import type { ResearchOutput } from "@/lib/types";

export function SynthesisPanel({ output }: { output: ResearchOutput }) {
  const [openQuestionsOpen, setOpenQuestionsOpen] = useState(false);
  const [limitationsOpen, setLimitationsOpen] = useState(false);

  return (
    <div
      style={{
        animation: "fadeUp 0.5s ease-out both",
        animationDelay: "0.1s",
      }}
      className="space-y-5"
    >
      <GlassPanel variant="elevated" className="p-5 sm:p-6">
        <h3 className="mb-3 font-heading text-xl font-semibold leading-snug text-white">
          Research Findings
        </h3>
        <div className="whitespace-pre-wrap text-sm leading-7 text-slate-200">
          {highlightCitations(output.summary)}
        </div>
      </GlassPanel>

      {output.keyFindings.length > 0 && (
        <div>
          <SectionLabel>Key Findings</SectionLabel>
          <div className="mt-2.5 space-y-2.5">
            {output.keyFindings.map((finding, i) => (
              <GlassPanel key={i} variant="default" className="p-3.5 sm:p-4">
                <div className="flex gap-3">
                  <span className="mt-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full border border-teal-300/30 bg-teal-300/10 px-1.5 font-mono text-[10px] font-semibold text-teal-100">
                    {i + 1}
                  </span>
                  <p className="text-sm leading-7 text-slate-200">
                    {highlightCitations(finding)}
                  </p>
                </div>
              </GlassPanel>
            ))}
          </div>
        </div>
      )}

      {output.openQuestions.length > 0 && (
        <CollapsibleList
          title="Open Questions"
          open={openQuestionsOpen}
          onToggle={() => setOpenQuestionsOpen((value) => !value)}
          items={output.openQuestions}
          marker="?"
          itemTone="text-slate-300"
          markerTone="text-amber-300"
        />
      )}

      {output.limitations.length > 0 && (
        <CollapsibleList
          title="Limitations"
          open={limitationsOpen}
          onToggle={() => setLimitationsOpen((value) => !value)}
          items={output.limitations}
          marker="-"
          itemTone="text-slate-400"
          markerTone="text-slate-500"
        />
      )}
    </div>
  );
}

function CollapsibleList({
  title,
  open,
  onToggle,
  items,
  marker,
  itemTone,
  markerTone,
}: {
  title: string;
  open: boolean;
  onToggle: () => void;
  items: string[];
  marker: string;
  itemTone: string;
  markerTone: string;
}) {
  return (
    <GlassPanel variant="muted" className="p-3.5">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-3 text-left"
        aria-expanded={open}
      >
        <SectionLabel>{title}</SectionLabel>
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={`text-slate-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      <div className="accordion-content" data-open={open}>
        <div className="accordion-inner">
          <div className="mt-2.5 space-y-2">
            {items.map((item, i) => (
              <div key={i} className={`flex gap-2 text-sm leading-6 ${itemTone}`}>
                <span className={`mt-0.5 font-mono text-xs ${markerTone}`}>{marker}</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </GlassPanel>
  );
}

function highlightCitations(text: string): ReactNode {
  const parts = text.split(/(\[S\d+\])/g);
  return parts.map((part, i) => {
    if (/\[S\d+\]/.test(part)) {
      return (
        <span
          key={i}
          className="mx-0.5 inline-flex items-center rounded-md border border-teal-300/35 bg-teal-300/10 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-teal-100"
        >
          {part}
        </span>
      );
    }
    return part;
  });
}
