"use client";

import { useEffect, useState } from "react";
import { MetricCard, SectionLabel } from "@/components/ui";
import type { EvaluationResult, SessionStatus } from "@/lib/types";

export function ObservabilityPanel({
  evaluation,
  status,
  createdAt,
}: {
  evaluation: EvaluationResult | null;
  status: SessionStatus;
  createdAt: string;
}) {
  const [now, setNow] = useState(() => Date.now());
  const isActive = status !== "complete" && status !== "failed";

  useEffect(() => {
    if (!isActive) return;
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [isActive]);

  const startedAt = new Date(createdAt).getTime();
  const elapsedMs = evaluation?.latencyMs ?? Math.max(0, now - startedAt);

  return (
    <div>
      <div className="flex items-end justify-between gap-4">
        <div>
          <SectionLabel>Run details</SectionLabel>
          <h2 className="mt-2 font-heading text-3xl font-medium tracking-[-0.035em] text-[color:var(--paper)]">Research log</h2>
        </div>
        <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-[color:var(--paper-faint)]">{status}</span>
      </div>

      <div className="mt-5 grid border-y border-[color:var(--rule)] sm:grid-cols-2 sm:divide-x sm:divide-[color:var(--rule)]">
        <div className="px-0 sm:pr-5">
          <MetricCard label="Run time" value={`${(elapsedMs / 1000).toFixed(1)}s`} />
          <MetricCard label="Estimated cost" value={evaluation ? `$${evaluation.estimatedCostUsd.toFixed(4)}` : "Pending"} />
          <MetricCard label="Sources" value={evaluation ? String(evaluation.sourceCount) : "Pending"} />
        </div>
        <div className="px-0 sm:pl-5">
          <MetricCard label="Source coverage" value={evaluation ? `${Math.round(evaluation.coverageScore * 100)}%` : "Pending"} />
          <MetricCard label="Citation coverage" value={evaluation ? `${Math.round(evaluation.citationCompleteness * 100)}%` : "Pending"} />
        </div>
      </div>

      {evaluation?.warnings && evaluation.warnings.length > 0 && (
        <div className="mt-5 border-l-2 border-[color:var(--signal)] pl-4">
          <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-[color:var(--signal)]">Review notes</p>
          <ul className="mt-3 space-y-2 text-xs leading-6 text-[color:var(--paper-muted)]">
            {evaluation.warnings.map((warning) => <li key={warning}>{warning}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}
