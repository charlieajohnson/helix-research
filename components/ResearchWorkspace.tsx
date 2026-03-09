"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useResearchStore } from "@/lib/store";
import { PipelineTracker } from "@/components/PipelineTracker";
import { SourceList } from "@/components/SourceCard";
import { SynthesisPanel } from "@/components/SynthesisPanel";
import { ObservabilityPanel } from "@/components/ObservabilityPanel";
import { TopBar } from "@/components/TopBar";
import { BottomBar } from "@/components/BottomBar";
import {
  GlassChip,
  GlassPanel,
  LoadingDots,
  LoadingSkeleton,
  SectionLabel,
} from "@/components/ui";

export function ResearchWorkspace({ sessionId }: { sessionId: string }) {
  const router = useRouter();
  const [mobileObservabilityOpen, setMobileObservabilityOpen] = useState(false);

  const {
    currentSession,
    recentSessions,
    fetchRecentSessions,
    clearSession,
  } = useResearchStore();

  useEffect(() => {
    fetchRecentSessions();
  }, [fetchRecentSessions]);

  if (!currentSession) return null;

  const { session, plan, sources, output, evaluation } = currentSession;
  const status = session.status;
  const isActive = status !== "complete" && status !== "failed";

  const handleNewResearch = () => {
    clearSession();
    router.push("/");
  };

  const handleSessionClick = (id: string) => {
    if (id === sessionId) return;
    clearSession();
    router.push(`/research/${id}`);
  };

  return (
    <div className="flex h-screen flex-col">
      <TopBar onNewResearch={handleNewResearch} />

      <div className="flex-1 overflow-hidden px-3 pb-3 sm:px-4">
        <div className="flex h-full gap-3">
          <aside className="hidden w-64 lg:block xl:w-72">
            <GlassPanel variant="muted" className="flex h-full flex-col p-3">
              <div>
                <SectionLabel>Current Query</SectionLabel>
                <GlassPanel variant="default" className="mt-2 p-2.5">
                  <p className="text-sm leading-6 text-slate-200">{session.query}</p>
                </GlassPanel>
              </div>

              {plan && (
                <div className="mt-4 min-h-0 flex-1 overflow-y-auto pr-1">
                  <SectionLabel>Search Plan</SectionLabel>
                  <div className="mt-2.5 space-y-2.5">
                    {plan.subquestions.map((question, i) => (
                      <div
                        key={i}
                        className="flex gap-2 text-xs leading-5 text-slate-300/90"
                        style={{
                          animation: "fadeUp 0.3s ease-out both",
                          animationDelay: `${i * 0.06}s`,
                        }}
                      >
                        <span className="font-mono text-slate-500">{i + 1}.</span>
                        <span>{question}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {recentSessions.length > 1 && (
                <div className="mt-4 border-t border-white/10 pt-3">
                  <SectionLabel>Recent</SectionLabel>
                  <div className="mt-2 space-y-1.5">
                    {recentSessions
                      .filter((recentSession) => recentSession.id !== sessionId)
                      .slice(0, 8)
                      .map((recentSession) => (
                        <button
                          key={recentSession.id}
                          onClick={() => handleSessionClick(recentSession.id)}
                          className="glass-panel glass-panel-interactive glass-panel-muted w-full rounded-xl px-2.5 py-2 text-left"
                        >
                          <p className="line-clamp-2 text-xs leading-5 text-slate-300">
                            {recentSession.query}
                          </p>
                          <div className="mt-1.5 flex items-center gap-1.5">
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                recentSession.status === "complete"
                                  ? "bg-emerald-300"
                                  : recentSession.status === "failed"
                                    ? "bg-red-300"
                                    : "bg-amber-300"
                              }`}
                            />
                            <span className="font-mono text-[9px] uppercase tracking-[0.08em] text-slate-500">
                              {formatRelativeTime(recentSession.createdAt)}
                            </span>
                          </div>
                        </button>
                      ))}
                  </div>
                </div>
              )}
            </GlassPanel>
          </aside>

          <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
            <PipelineTracker status={status} />

            <div className="flex-1 overflow-y-auto">
              <div className="mx-auto w-full max-w-4xl space-y-5 pb-4">
                <StageHeader status={status} query={session.query} />

                {plan && isActive && (
                  <GlassPanel variant="default" className="p-4" style={{ animation: "fadeUp 0.4s ease-out both" }}>
                    <div className="mb-2 flex items-center gap-2">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="text-teal-200">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                      <span className="text-sm font-semibold text-slate-100">Research Plan</span>
                    </div>
                    <p className="text-sm leading-6 text-slate-300">{plan.objective}</p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {plan.searchQueries.web.map((query, i) => (
                        <GlassChip key={`web-${i}`} tone="sky" active className="cursor-default" disabled>
                          {query}
                        </GlassChip>
                      ))}
                      {plan.searchQueries.papers.map((query, i) => (
                        <GlassChip key={`paper-${i}`} tone="violet" active className="cursor-default" disabled>
                          {query}
                        </GlassChip>
                      ))}
                    </div>
                  </GlassPanel>
                )}

                {output ? <SynthesisPanel output={output} /> : isActive ? <ResultSkeleton /> : null}

                {sources.length > 0 && <SourceList sources={sources} />}

                {isActive && (
                  <div className="glass-panel glass-panel-muted rounded-[var(--panel-radius)] px-3.5 py-3">
                    <div className="flex items-center gap-3">
                      <LoadingDots />
                      <span className="text-sm text-slate-300">
                        {getLoadingMessage(status)}
                      </span>
                    </div>
                  </div>
                )}

                {status === "failed" && (
                  <GlassPanel variant="muted" className="border-red-300/25 p-4">
                    <div className="flex items-center gap-2 text-sm text-red-200">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                      </svg>
                      Research pipeline encountered an error. Please try again.
                    </div>
                  </GlassPanel>
                )}

                <div className="hidden lg:block xl:hidden">
                  <GlassPanel variant="muted" className="overflow-hidden">
                    <ObservabilityPanel evaluation={evaluation} status={status} />
                  </GlassPanel>
                </div>

                <div className="lg:hidden">
                  <GlassPanel variant="muted" className="p-3">
                    <button
                      onClick={() => setMobileObservabilityOpen((value) => !value)}
                      className="flex w-full items-center justify-between gap-2"
                      aria-expanded={mobileObservabilityOpen}
                    >
                      <SectionLabel>Observability</SectionLabel>
                      <svg
                        width="15"
                        height="15"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className={`text-slate-400 transition-transform duration-200 ${
                          mobileObservabilityOpen ? "rotate-180" : ""
                        }`}
                      >
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </button>

                    <div className="accordion-content" data-open={mobileObservabilityOpen}>
                      <div className="accordion-inner">
                        <div className="mt-3">
                          <ObservabilityPanel evaluation={evaluation} status={status} />
                        </div>
                      </div>
                    </div>
                  </GlassPanel>
                </div>
              </div>
            </div>

            <BottomBar evaluation={evaluation} status={status} />
          </main>

          <aside className="hidden w-72 xl:block">
            <GlassPanel variant="muted" className="h-full overflow-hidden">
              <ObservabilityPanel evaluation={evaluation} status={status} />
            </GlassPanel>
          </aside>
        </div>
      </div>
    </div>
  );
}

function StageHeader({ status, query }: { status: string; query: string }) {
  const titles: Record<string, string> = {
    intake: "Initializing",
    planning: "Planning Research",
    searching: "Searching Sources",
    ranking: "Ranking Results",
    synthesizing: "Synthesis In Progress",
    evaluating: "Evaluating Quality",
    complete: "Research Complete",
    failed: "Research Failed",
  };

  return (
    <GlassPanel variant="elevated" className="p-4 sm:p-5">
      <div className="flex items-start gap-3">
        {status !== "complete" && status !== "failed" ? (
          <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full border border-teal-300/35 bg-teal-300/12 text-teal-200">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="ml-0.5">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
          </div>
        ) : (
          <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-white/10 text-slate-300">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
              {status === "complete" ? (
                <polyline points="20 6 9 17 4 12" />
              ) : (
                <>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </>
              )}
            </svg>
          </div>
        )}

        <div className="min-w-0">
          <h2 className="font-heading text-xl font-semibold text-white sm:text-2xl">
            {titles[status] ?? "Processing"}
          </h2>
          <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-300">
            {query}
          </p>
        </div>
      </div>
    </GlassPanel>
  );
}

function ResultSkeleton() {
  return (
    <GlassPanel variant="elevated" className="space-y-3 p-5">
      <LoadingSkeleton className="h-5 w-44" />
      <LoadingSkeleton className="h-3.5 w-full" />
      <LoadingSkeleton className="h-3.5 w-[92%]" />
      <LoadingSkeleton className="h-3.5 w-[88%]" />
      <div className="grid gap-2 pt-1">
        <LoadingSkeleton className="h-16 w-full" />
        <LoadingSkeleton className="h-16 w-full" />
      </div>
    </GlassPanel>
  );
}

function getLoadingMessage(status: string): string {
  switch (status) {
    case "intake":
      return "Creating research session...";
    case "planning":
      return "Analyzing query and generating search plan...";
    case "searching":
      return "Searching web and academic sources...";
    case "ranking":
      return "Deduplicating and ranking results...";
    case "synthesizing":
      return "Synthesizing findings into a research brief...";
    case "evaluating":
      return "Computing quality metrics...";
    default:
      return "Processing...";
  }
}

function formatRelativeTime(iso: string): string {
  const now = Date.now();
  const then = new Date(iso).getTime();
  const diff = now - then;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
