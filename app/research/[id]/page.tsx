"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { useResearchStore } from "@/lib/store";
import { ResearchWorkspace } from "@/components/ResearchWorkspace";
import { GlassPanel } from "@/components/ui";

export default function ResearchPage() {
  const params = useParams();
  const id = params.id as string;
  const { currentSession, startPolling, stopPolling, error } = useResearchStore();

  useEffect(() => {
    if (!id) return;
    startPolling(id);
    return () => stopPolling();
  }, [id, startPolling, stopPolling]);

  if (!currentSession) {
    return (
      <div className="flex h-screen items-center justify-center px-4">
        <GlassPanel variant="muted" className="p-5">
          <div className="flex flex-col items-center gap-3">
            <div className="flex items-center gap-3 text-slate-300">
              <svg
                className="animate-spin"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
              <span className="text-sm">Loading research session...</span>
            </div>
            {error && <p className="text-xs text-red-300">{error}</p>}
          </div>
        </GlassPanel>
      </div>
    );
  }

  return <ResearchWorkspace sessionId={id} />;
}
