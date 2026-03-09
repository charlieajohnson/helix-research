"use client";

import type { EvaluationResult, SessionStatus } from "@/lib/types";
import { GlassPanel } from "@/components/ui";

export function BottomBar({
  evaluation,
  status,
  startTime,
}: {
  evaluation: EvaluationResult | null;
  status: SessionStatus;
  startTime?: number;
}) {
  const elapsed = startTime
    ? ((Date.now() - startTime) / 1000).toFixed(1)
    : evaluation
      ? (evaluation.latencyMs / 1000).toFixed(1)
      : "0.0";

  const cost = evaluation ? `$${evaluation.estimatedCostUsd.toFixed(4)}` : "--";

  return (
    <div className="px-3 pb-3 pt-2 sm:px-4">
      <GlassPanel variant="muted" className="px-4 py-2">
        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3 font-mono text-[11px] text-slate-400">
            <span className="inline-flex items-center gap-1.5">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-500">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="16" />
                <line x1="8" y1="12" x2="16" y2="12" />
              </svg>
              {cost}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-500">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              {elapsed}s
            </span>
          </div>

          <div
            className={`inline-flex h-7 w-7 items-center justify-center rounded-full border ${
              status === "complete" || status === "failed"
                ? "border-white/10 bg-white/5 text-slate-500"
                : "border-teal-300/35 bg-teal-400/15 text-teal-200"
            }`}
            aria-label="Pipeline status"
          >
            {status === "complete" || status === "failed" ? (
              <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="6" width="12" height="12" rx="1" />
              </svg>
            ) : (
              <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" className="ml-0.5">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
            )}
          </div>
        </div>
      </GlassPanel>
    </div>
  );
}
