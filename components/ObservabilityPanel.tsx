"use client";

import { GlassPanel, MetricCard, SectionLabel } from "@/components/ui";
import type { EvaluationResult, SessionStatus } from "@/lib/types";

export function ObservabilityPanel({
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
      : "—";

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 pt-4 pb-2">
        <SectionLabel>Observability</SectionLabel>
      </div>

      {/* Stage timing icons */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/20">
        <StageIcon label="Search" active={["searching", "ranking"].includes(status)} complete={isAfter(status, "ranking")} />
        <StageIcon label="Synthesis" active={status === "synthesizing"} complete={isAfter(status, "synthesizing")} />
        <StageIcon label="Evaluation" active={status === "evaluating"} complete={isAfter(status, "evaluating")} />
        <div className="font-mono text-xs text-slate-400">{elapsed}s</div>
      </div>

      {/* Metrics */}
      <div className="flex-1 p-4 space-y-3 overflow-y-auto">
        <MetricCard
          label="Cost"
          value={evaluation ? `$${evaluation.estimatedCostUsd.toFixed(4)}` : "—"}
          color="amber"
          icon={
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="16" />
              <line x1="8" y1="12" x2="16" y2="12" />
            </svg>
          }
        />

        <MetricCard
          label="Latency"
          value={evaluation ? `${(evaluation.latencyMs / 1000).toFixed(1)}s` : `${elapsed}s`}
          color="default"
          icon={
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          }
        />

        <MetricCard
          label="Source Coverage"
          value={evaluation ? `${(evaluation.coverageScore * 100).toFixed(0)}%` : "—"}
          color={evaluation && evaluation.coverageScore > 0.6 ? "green" : "default"}
          icon={
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          }
        />

        <MetricCard
          label="Citation Coverage"
          value={evaluation ? `${(evaluation.citationCompleteness * 100).toFixed(0)}%` : "—"}
          color={evaluation && evaluation.citationCompleteness > 0.5 ? "cyan" : "default"}
          icon={
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
          }
        />

        <MetricCard
          label="Sources"
          value={evaluation ? String(evaluation.sourceCount) : "—"}
          color="default"
          icon={
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <line x1="9" y1="3" x2="9" y2="21" />
            </svg>
          }
        />

        {/* Warnings */}
        {evaluation?.warnings && evaluation.warnings.length > 0 && (
          <div className="mt-2">
            <SectionLabel>Warnings</SectionLabel>
            <div className="mt-1.5 space-y-1">
              {evaluation.warnings.map((w, i) => (
                <div key={i} className="flex gap-1.5 text-[11px] text-amber-400/70">
                  <span>⚠</span>
                  <span>{w}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StageIcon({
  label,
  active,
  complete,
}: {
  label: string;
  active: boolean;
  complete: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={`w-6 h-6 rounded-md flex items-center justify-center transition-all ${
          complete
            ? "bg-teal-500/15 text-teal-400"
            : active
              ? "bg-teal-500/10 text-teal-400 animate-pulse"
              : "bg-slate-800/30 text-slate-600"
        }`}
      >
        {complete ? (
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        ) : (
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
          </svg>
        )}
      </div>
      <span className="font-mono text-[8px] text-slate-500">{label}</span>
    </div>
  );
}

function isAfter(current: SessionStatus, target: SessionStatus): boolean {
  const order: SessionStatus[] = [
    "intake", "planning", "searching", "ranking",
    "synthesizing", "evaluating", "complete",
  ];
  return order.indexOf(current) > order.indexOf(target);
}
