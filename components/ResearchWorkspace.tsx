"use client";

import { useResearchStore } from "@/lib/store";
import { PipelineTracker } from "@/components/PipelineTracker";
import { SourceList } from "@/components/SourceCard";
import { SynthesisPanel } from "@/components/SynthesisPanel";
import { ObservabilityPanel } from "@/components/ObservabilityPanel";
import { TopBar } from "@/components/TopBar";
import { BottomBar } from "@/components/BottomBar";
import { GlassPanel, LoadingDots, SectionLabel } from "@/components/ui";

export function ResearchWorkspace() {
  const { currentSession, isLoading, clearSession } = useResearchStore();

  if (!currentSession) return null;

  const { session, plan, sources, output, evaluation } = currentSession;
  const status = session.status;

  return (
    <div className="h-screen flex flex-col">
      <TopBar onNewResearch={clearSession} />

      <div className="flex-1 flex overflow-hidden">
        {/* Left sidebar — recent queries (simplified for MVP) */}
        <div className="w-56 border-r border-slate-700/20 glass hidden lg:flex flex-col">
          <div className="p-4">
            <SectionLabel>Current Query</SectionLabel>
          </div>
          <div className="px-3 py-2">
            <div className="text-sm text-slate-300 px-2 py-1.5 rounded-card bg-teal-500/5 border border-teal-500/10">
              {session.query}
            </div>
          </div>

          {/* Plan details */}
          {plan && (
            <div className="px-4 mt-4 flex-1 overflow-y-auto">
              <SectionLabel>Search Plan</SectionLabel>
              <div className="mt-2 space-y-2">
                {plan.subquestions.map((q, i) => (
                  <div
                    key={i}
                    className="text-xs text-slate-500 flex gap-1.5"
                    style={{
                      animation: "fadeUp 0.3s ease-out both",
                      animationDelay: `${i * 0.1}s`,
                    }}
                  >
                    <span className="text-slate-600 flex-shrink-0">{i + 1}.</span>
                    <span>{q}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Center — main content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Pipeline tracker */}
          <div className="border-b border-slate-700/20">
            <PipelineTracker status={status} />
          </div>

          {/* Scrollable content area */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="max-w-3xl mx-auto space-y-6">
              {/* Status header */}
              <StageHeader status={status} query={session.query} />

              {/* Plan summary (when available) */}
              {plan && (status === "planning" || status === "searching" || status === "ranking") && (
                <GlassPanel className="p-4" style={{ animation: "fadeUp 0.4s ease-out both" } as any}>
                  <div className="flex items-center gap-2 mb-2">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-teal-400">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    <span className="text-sm font-medium text-slate-300">Research Plan</span>
                  </div>
                  <p className="text-sm text-slate-400 mb-2">{plan.objective}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {plan.searchQueries.web.map((q, i) => (
                      <span key={`web-${i}`} className="text-[10px] font-mono px-2 py-0.5 rounded-pill bg-sky-500/10 text-sky-400 border border-sky-500/20">
                        {q}
                      </span>
                    ))}
                    {plan.searchQueries.papers.map((q, i) => (
                      <span key={`paper-${i}`} className="text-[10px] font-mono px-2 py-0.5 rounded-pill bg-violet-500/10 text-violet-400 border border-violet-500/20">
                        {q}
                      </span>
                    ))}
                  </div>
                </GlassPanel>
              )}

              {/* Synthesis — the main event, always on top */}
              {output && <SynthesisPanel output={output} />}

              {/* Sources — supporting evidence below */}
              {sources.length > 0 && <SourceList sources={sources} />}

              {/* Loading state */}
              {isLoading && status !== "complete" && status !== "failed" && (
                <div className="flex items-center gap-3 py-4">
                  <LoadingDots />
                  <span className="text-sm text-slate-500">
                    {getLoadingMessage(status)}
                  </span>
                </div>
              )}

              {/* Error state */}
              {status === "failed" && (
                <GlassPanel className="p-4 border-red-500/20">
                  <div className="flex items-center gap-2 text-red-400 text-sm">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    Research pipeline encountered an error. Please try again.
                  </div>
                </GlassPanel>
              )}
            </div>
          </div>

          {/* Bottom bar */}
          <BottomBar evaluation={evaluation} status={status} />
        </div>

        {/* Right sidebar — observability */}
        <div className="w-64 border-l border-slate-700/20 glass hidden xl:flex flex-col">
          <ObservabilityPanel evaluation={evaluation} status={status} />
        </div>
      </div>
    </div>
  );
}

function StageHeader({
  status,
  query,
}: {
  status: string;
  query: string;
}) {
  const titles: Record<string, string> = {
    intake: "Initializing...",
    planning: "Planning Research",
    searching: "Searching Sources",
    ranking: "Ranking Results",
    synthesizing: "Synthesis In Progress",
    evaluating: "Evaluating Quality",
    complete: "Research Complete",
    failed: "Research Failed",
  };

  return (
    <div className="flex items-center gap-3">
      {status !== "complete" && status !== "failed" && (
        <div className="w-8 h-8 rounded-full bg-teal-500/10 border border-teal-500/20 flex items-center justify-center animate-pulse">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="text-teal-400 ml-0.5">
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
        </div>
      )}
      {status === "complete" && (
        <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-emerald-400">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
      )}
      <h2 className="font-heading text-xl font-semibold text-white">
        {titles[status] ?? "Processing..."}
      </h2>
    </div>
  );
}

function getLoadingMessage(status: string): string {
  switch (status) {
    case "planning": return "Analyzing query and generating search plan...";
    case "searching": return "Searching web and academic sources...";
    case "ranking": return "Deduplicating and ranking results...";
    case "synthesizing": return "Synthesizing findings into a research brief...";
    case "evaluating": return "Computing quality metrics...";
    default: return "Processing...";
  }
}
