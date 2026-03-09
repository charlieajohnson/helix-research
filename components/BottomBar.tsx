"use client";

import type { EvaluationResult, SessionStatus } from "@/lib/types";

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

  const cost = evaluation ? `$${evaluation.estimatedCostUsd.toFixed(4)}` : "—";

  return (
    <div className="flex items-center justify-between px-5 py-2 border-t border-slate-700/20 glass">
      <div className="flex items-center gap-4 font-mono text-[11px] text-slate-500">
        <span className="flex items-center gap-1.5">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-600">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="16" />
            <line x1="8" y1="12" x2="16" y2="12" />
          </svg>
          {cost}
        </span>
        <span className="flex items-center gap-1.5">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-600">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          {elapsed}s
        </span>
      </div>

      <div className="flex items-center gap-2">
        {/* Play/stop indicator */}
        <div
          className={`w-7 h-7 rounded-full flex items-center justify-center ${
            status === "complete" || status === "failed"
              ? "bg-slate-700/30"
              : "bg-teal-500/20"
          }`}
        >
          {status === "complete" || status === "failed" ? (
            <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" className="text-slate-500">
              <rect x="6" y="6" width="12" height="12" rx="1" />
            </svg>
          ) : (
            <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" className="text-teal-400 ml-0.5">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
          )}
        </div>
      </div>
    </div>
  );
}
