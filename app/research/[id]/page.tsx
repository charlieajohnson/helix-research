"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { useResearchStore } from "@/lib/store";
import { ResearchWorkspace } from "@/components/ResearchWorkspace";

export default function ResearchPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const invalidId = !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id ?? "");
  const { currentSession, startPolling, stopPolling, error } = useResearchStore();

  useEffect(() => {
    if (!id || invalidId) return;
    startPolling(id);
    return () => stopPolling();
  }, [id, invalidId, startPolling, stopPolling]);

  if (invalidId) {
    return <UnavailableBrief message="Invalid research record." />;
  }

  if (!currentSession) {
    if (error && !error.startsWith("Connection interrupted")) {
      return <UnavailableBrief message={error} />;
    }

    return (
      <main className="flex min-h-[100dvh] items-center justify-center px-5" aria-live="polite">
        <div className="flex items-center gap-3 border-y border-[color:var(--rule)] px-5 py-5">
          <span className="h-2 w-2 animate-pulse bg-[color:var(--signal)]" aria-hidden="true" />
          <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-[color:var(--paper-muted)]">
            {error ?? "Opening research record"}
          </span>
        </div>
      </main>
    );
  }

  return <ResearchWorkspace sessionId={id} />;
}

function UnavailableBrief({ message }: { message: string }) {
  return (
    <main className="flex min-h-[100dvh] items-center justify-center px-5 py-12">
      <section className="w-full max-w-xl border-y border-[color:var(--rule)] py-10 text-center" role="alert">
        <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-[color:var(--signal)]">Research record unavailable</p>
        <h1 className="mt-4 font-heading text-[clamp(2rem,5vw,2.5rem)] font-medium leading-[1.05] tracking-[-0.035em] text-[color:var(--paper)]">This brief could not be opened.</h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-[color:var(--paper-muted)]">{message}</p>
        <a href="/" className="mt-7 inline-flex min-h-11 items-center border border-[color:var(--rule)] px-5 py-3 font-mono text-[9px] uppercase tracking-[0.14em] text-[color:var(--paper)] transition-colors hover:border-[color:var(--signal)]">
          Start a new brief
        </a>
      </section>
    </main>
  );
}
