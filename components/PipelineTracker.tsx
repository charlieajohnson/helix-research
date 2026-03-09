"use client";

import type { SessionStatus } from "@/lib/types";

const STAGES: { key: SessionStatus[]; label: string }[] = [
  { key: ["planning"], label: "PLAN" },
  { key: ["searching", "ranking"], label: "SEARCH" },
  { key: ["synthesizing"], label: "SYNTHESIZE" },
  { key: ["evaluating"], label: "EVALUATE" },
];

function getStageState(
  stageKeys: SessionStatus[],
  currentStatus: SessionStatus
): "pending" | "active" | "complete" {
  const statusOrder: SessionStatus[] = [
    "intake",
    "planning",
    "searching",
    "ranking",
    "synthesizing",
    "evaluating",
    "complete",
  ];

  const currentIdx = statusOrder.indexOf(currentStatus);
  const stageMaxIdx = Math.max(
    ...stageKeys.map((k) => statusOrder.indexOf(k))
  );
  const stageMinIdx = Math.min(
    ...stageKeys.map((k) => statusOrder.indexOf(k))
  );

  if (currentIdx > stageMaxIdx) return "complete";
  if (currentIdx >= stageMinIdx && currentIdx <= stageMaxIdx) return "active";
  return "pending";
}

export function PipelineTracker({ status }: { status: SessionStatus }) {
  return (
    <div className="flex items-center justify-center gap-0 py-4">
      {/* New research button */}
      <div className="w-6 h-6 rounded-md bg-slate-800/50 border border-slate-700/30 flex items-center justify-center mr-3">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-500">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </div>

      {STAGES.map((stage, i) => {
        const state = getStageState(stage.key, status);
        return (
          <div key={stage.label} className="flex items-center">
            {/* Connector line */}
            {i > 0 && (
              <div
                className={`w-8 h-[2px] mx-1 transition-colors duration-500 ${
                  state === "pending"
                    ? "bg-slate-700/30"
                    : "bg-teal-500/30"
                }`}
              />
            )}

            {/* Stage pill */}
            <div
              className={`px-3 py-1 rounded-pill font-mono text-[11px] font-medium tracking-wide transition-all duration-500 ${
                state === "active"
                  ? "bg-teal-500/15 text-white border border-teal-500/30 shadow-[0_0_12px_rgba(94,234,212,0.1)]"
                  : state === "complete"
                    ? "text-teal-400/60 border border-transparent"
                    : "text-slate-600 border border-transparent"
              }`}
            >
              {stage.label}
            </div>
          </div>
        );
      })}

      {/* Status dots */}
      <div className="flex items-center gap-1 ml-3">
        {status === "complete" ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-emerald-400">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        ) : status === "failed" ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-red-400">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <>
            <div className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
            <div className="w-1.5 h-1.5 rounded-full bg-teal-400/50 animate-pulse" style={{ animationDelay: "0.3s" }} />
            <div className="w-1.5 h-1.5 rounded-full bg-teal-400/30 animate-pulse" style={{ animationDelay: "0.6s" }} />
          </>
        )}
      </div>
    </div>
  );
}
