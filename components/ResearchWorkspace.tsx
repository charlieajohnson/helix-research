"use client";

import { useRouter } from "next/navigation";
import { useResearchStore } from "@/lib/store";
import { PipelineTracker } from "@/components/PipelineTracker";
import { SourceList } from "@/components/SourceCard";
import { SynthesisPanel } from "@/components/SynthesisPanel";
import { ObservabilityPanel } from "@/components/ObservabilityPanel";
import { TopBar } from "@/components/TopBar";
import { GlassButton, LoadingDots, LoadingSkeleton, SectionLabel } from "@/components/ui";
import type { ResearchPlan, ResearchSession, SessionStatus } from "@/lib/types";

export function ResearchWorkspace({ sessionId }: { sessionId: string }) {
  const router = useRouter();
  const { currentSession, clearSession } = useResearchStore();

  if (!currentSession || currentSession.session.id !== sessionId) return null;

  const { session, plan, sources, output, evaluation } = currentSession;
  const isActive = session.status !== "complete" && session.status !== "failed";

  const handleNewResearch = () => {
    clearSession();
    router.push("/");
  };

  return (
    <div className="research-shell flex h-[100dvh] flex-col overflow-hidden">
      <TopBar onNewResearch={handleNewResearch} />
      <PipelineTracker status={session.status} />

      <div className="min-h-0 flex-1 overflow-y-auto xl:grid xl:grid-cols-[17rem_minmax(0,1fr)_22rem] xl:overflow-hidden 2xl:grid-cols-[19rem_minmax(0,1fr)_24rem]">
        <aside className="hidden border-r border-[color:var(--rule)] p-6 xl:block xl:overflow-y-auto">
          <ScopeRail session={session} plan={plan} />
        </aside>

        <main className="min-w-0 px-5 py-8 sm:px-8 sm:py-10 lg:px-12 xl:overflow-y-auto xl:px-10 2xl:px-14">
          <div className="mx-auto max-w-4xl">
            <StageHeader status={session.status} query={session.query} sourceCount={sources.length} />

            {plan && (
              <div className="mt-8 xl:hidden">
                <PlanSummary plan={plan} />
              </div>
            )}

            <div className="mt-12">
              {output ? (
                <SynthesisPanel output={output} sources={sources} />
              ) : isActive ? (
                <ResultSkeleton />
              ) : null}
            </div>

            {isActive && (
              <div className="mt-8 flex items-center gap-3 border-y border-[color:var(--rule)] py-4" aria-live="polite">
                <LoadingDots />
                <span className="text-sm text-[color:var(--paper-muted)]">{loadingMessage(session.status)}</span>
              </div>
            )}

            {session.status === "failed" && (
              <section className="mt-8 border-l-2 border-[color:var(--danger)] pl-5" role="alert">
                <SectionLabel>Run interrupted</SectionLabel>
                <h2 className="mt-2 font-heading text-2xl font-medium text-[color:var(--paper)] sm:text-[1.75rem]">The brief could not be completed.</h2>
                <p className="mt-3 max-w-xl text-sm leading-6 text-[color:var(--paper-muted)]">No completed result was published. Start a new brief or narrow the question and try again.</p>
                <GlassButton onClick={handleNewResearch} className="mt-5">Start again</GlassButton>
              </section>
            )}

            <details className="group mt-14 border-y border-[color:var(--rule)] py-3">
              <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between font-mono text-[9px] uppercase tracking-[0.16em] text-[color:var(--paper-muted)]">
                Run details
                <span className="text-[color:var(--signal)] transition-transform group-open:rotate-45" aria-hidden="true">+</span>
              </summary>
              <div className="pb-5 pt-5">
                <ObservabilityPanel evaluation={evaluation} status={session.status} createdAt={session.createdAt} />
              </div>
            </details>

            <p className="mt-10 border-l border-[color:var(--rule-strong)] pl-4 text-xs leading-6 text-[color:var(--paper-faint)]">
              Verify material claims against the linked primary sources before relying on this brief.
            </p>
          </div>
        </main>

        <aside className="border-t border-[color:var(--rule)] px-5 py-8 sm:px-8 xl:overflow-y-auto xl:border-l xl:border-t-0 xl:px-6 xl:py-10">
          <SourceList sources={sources} />
        </aside>
      </div>
    </div>
  );
}

function ScopeRail({ session, plan }: { session: ResearchSession; plan: ResearchPlan | null }) {
  return (
    <div>
      <SectionLabel>Brief scope</SectionLabel>
      <p className="mt-4 text-sm leading-6 text-[color:var(--paper)] [overflow-wrap:anywhere]">{session.query}</p>
      <div className="mt-5 flex flex-wrap gap-2 font-mono text-[8px] uppercase tracking-[0.12em] text-[color:var(--paper-faint)]">
        <span className="border border-[color:var(--rule)] px-2 py-1.5">{session.config.depth}</span>
        {session.config.includeWeb && <span className="border border-[color:var(--rule)] px-2 py-1.5">Web</span>}
        {session.config.includeArxiv && <span className="border border-[color:var(--rule)] px-2 py-1.5">arXiv</span>}
      </div>
      {plan && (
        <div className="mt-10">
          <PlanSummary plan={plan} compact />
        </div>
      )}
    </div>
  );
}

function PlanSummary({ plan, compact = false }: { plan: ResearchPlan; compact?: boolean }) {
  return (
    <section>
      <SectionLabel>Research plan</SectionLabel>
      {!compact && <p className="mt-3 text-sm leading-6 text-[color:var(--paper-muted)] [overflow-wrap:anywhere]">{plan.objective}</p>}
      <ol className="mt-4 border-t border-[color:var(--rule)]">
        {plan.subquestions.map((question, index) => (
          <li key={question} className="grid grid-cols-[1.5rem_minmax(0,1fr)] gap-2 border-b border-[color:var(--rule)] py-3 text-xs leading-5 text-[color:var(--paper-muted)] [overflow-wrap:anywhere]">
            <span className="font-mono text-[8px] text-[color:var(--signal)]">0{index + 1}</span>
            <span>{question}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}

function StageHeader({ status, query, sourceCount }: { status: SessionStatus; query: string; sourceCount: number }) {
  const labels: Record<SessionStatus, string> = {
    intake: "Opening brief",
    planning: "Building the research plan",
    searching: "Searching the evidence base",
    ranking: "Resolving the source set",
    synthesizing: "Writing the executive read",
    evaluating: "Checking coverage and citations",
    complete: "Brief complete",
    failed: "Run interrupted",
  };
  const titleStyle =
    query.length > 180
      ? "text-[clamp(1.75rem,2vw,2.25rem)] leading-[1.05]"
      : query.length > 100
        ? "text-[clamp(1.875rem,2.4vw,2.625rem)] leading-[1.02]"
        : "text-[clamp(2rem,2.8vw,3rem)] leading-[1.02]";

  return (
    <header className="border-b border-[color:var(--rule-strong)] pb-8">
      <div className="flex flex-wrap items-center justify-between gap-3 font-mono text-[9px] uppercase tracking-[0.16em]">
        <span className={status === "failed" ? "text-[color:var(--danger)]" : "text-[color:var(--signal)]"}>{labels[status]}</span>
        <span className="text-[color:var(--paper-faint)]">{sourceCount > 0 ? `${sourceCount} sources` : "Source set pending"}</span>
      </div>
      <h1 className={`mt-5 max-w-4xl font-heading font-medium tracking-[-0.035em] text-[color:var(--paper)] [overflow-wrap:anywhere] [text-wrap:pretty] ${titleStyle}`}>{query}</h1>
    </header>
  );
}

function ResultSkeleton() {
  return (
    <div className="space-y-5" aria-label="Research brief is being prepared">
      <LoadingSkeleton className="h-3 w-32" />
      <LoadingSkeleton className="h-12 w-4/5" />
      <div className="space-y-3 pt-3">
        <LoadingSkeleton className="h-3 w-full" />
        <LoadingSkeleton className="h-3 w-[94%]" />
        <LoadingSkeleton className="h-3 w-[86%]" />
      </div>
      <div className="grid gap-px bg-[color:var(--rule)] pt-px">
        <LoadingSkeleton className="h-24 w-full bg-[color:var(--ink-soft)]" />
        <LoadingSkeleton className="h-24 w-full bg-[color:var(--ink-soft)]" />
      </div>
    </div>
  );
}

function loadingMessage(status: SessionStatus) {
  const messages: Partial<Record<SessionStatus, string>> = {
    intake: "Opening the research record",
    planning: "Defining the questions and search path",
    searching: "Collecting web and academic evidence",
    ranking: "Deduplicating and ranking sources",
    synthesizing: "Writing the brief with linked citations",
    evaluating: "Checking coverage, gaps and citation use",
  };
  return messages[status] ?? "Preparing the brief";
}
