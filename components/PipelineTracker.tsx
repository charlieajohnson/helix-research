"use client";

import type { SessionStatus } from "@/lib/types";
import { GlassPanel } from "@/components/ui";

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
  if (currentStatus === "failed") return "pending";

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
  const stageMaxIdx = Math.max(...stageKeys.map((k) => statusOrder.indexOf(k)));
  const stageMinIdx = Math.min(...stageKeys.map((k) => statusOrder.indexOf(k)));

  if (currentIdx > stageMaxIdx) return "complete";
  if (currentIdx >= stageMinIdx && currentIdx <= stageMaxIdx) return "active";
  return "pending";
}

export function PipelineTracker({ status }: { status: SessionStatus }) {
  return (
    <div className="px-4 py-3 sm:px-6">
      <GlassPanel variant="muted" className="mx-auto max-w-4xl px-2 py-2 sm:px-3">
        <div className="flex min-w-max items-center gap-1.5">
          {STAGES.map((stage, i) => {
            const state = getStageState(stage.key, status);
            return (
              <div key={stage.label} className="flex items-center gap-1.5">
                {i > 0 && (
                  <div
                    className={`h-px w-5 sm:w-7 ${
                      state === "pending" ? "bg-white/15" : "bg-teal-300/40"
                    }`}
                  />
                )}
                <div
                  className={`rounded-full px-3 py-1 font-mono text-[10px] font-semibold tracking-[0.12em] transition-all duration-300 ${
                    state === "active"
                      ? "border border-teal-300/35 bg-teal-300/15 text-teal-100 shadow-[0_0_18px_rgba(82,216,198,0.2)]"
                      : state === "complete"
                        ? "border border-teal-300/20 bg-teal-300/10 text-teal-200"
                        : "border border-white/10 text-slate-400"
                  }`}
                >
                  {stage.label}
                </div>
              </div>
            );
          })}

          <div className="ml-1 inline-flex items-center">
            {status === "complete" ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-emerald-300">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : status === "failed" ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-red-300">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <div className="inline-flex items-center gap-1.5 pl-1">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-teal-200" />
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-teal-200/60" style={{ animationDelay: "0.2s" }} />
              </div>
            )}
          </div>
        </div>
      </GlassPanel>
    </div>
  );
}
