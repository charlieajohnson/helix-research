"use client";

import type { SessionStatus } from "@/lib/types";

const STAGES: { keys: SessionStatus[]; label: string }[] = [
  { keys: ["planning"], label: "Plan" },
  { keys: ["searching", "ranking"], label: "Search" },
  { keys: ["synthesizing"], label: "Synthesis" },
  { keys: ["evaluating"], label: "Review" },
];

const ORDER: SessionStatus[] = [
  "intake",
  "planning",
  "searching",
  "ranking",
  "synthesizing",
  "evaluating",
  "complete",
];

function stageState(keys: SessionStatus[], current: SessionStatus) {
  if (current === "failed") return "failed";
  const currentIndex = ORDER.indexOf(current);
  const first = Math.min(...keys.map((key) => ORDER.indexOf(key)));
  const last = Math.max(...keys.map((key) => ORDER.indexOf(key)));
  if (currentIndex > last) return "complete";
  if (currentIndex >= first && currentIndex <= last) return "active";
  return "pending";
}

export function PipelineTracker({ status }: { status: SessionStatus }) {
  return (
    <nav aria-label="Research progress" className="shrink-0 border-b border-[color:var(--rule)] px-4 py-3 sm:px-6">
      <ol className="mx-auto grid max-w-4xl grid-cols-4">
        {STAGES.map((stage, index) => {
          const state = stageState(stage.keys, status);
          return (
            <li
              key={stage.label}
              aria-current={state === "active" ? "step" : undefined}
              className={`relative border-t pt-3 text-center font-mono text-[8px] uppercase tracking-[0.1em] sm:text-[9px] sm:tracking-[0.16em] ${
                state === "active"
                  ? "border-[color:var(--signal)] text-[color:var(--paper)]"
                  : state === "complete"
                    ? "border-[color:var(--signal)] text-[color:var(--paper-muted)]"
                    : state === "failed"
                      ? "border-[color:var(--danger)] text-[color:var(--danger)]"
                      : "border-[color:var(--rule)] text-[color:var(--paper-faint)]"
              }`}
            >
              <span className="mr-1.5 text-[color:var(--signal)]">0{index + 1}</span>
              {stage.label}
              <span
                className={`absolute -top-[3px] left-1/2 h-[5px] w-[5px] -translate-x-1/2 ${
                  state === "active" || state === "complete" ? "bg-[color:var(--signal)]" : "bg-[color:var(--ink)]"
                }`}
                aria-hidden="true"
              />
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
