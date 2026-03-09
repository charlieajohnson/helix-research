"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { useResearchStore } from "@/lib/store";
import { ResearchWorkspace } from "@/components/ResearchWorkspace";

export default function ResearchPage() {
  const params = useParams();
  const id = params.id as string;
  const { currentSession, startPolling, stopPolling, error } = useResearchStore();

  // Start polling when the page loads (or on refresh)
  useEffect(() => {
    if (!id) return;
    startPolling(id);
    return () => stopPolling();
  }, [id, startPolling, stopPolling]);

  // Loading state — no session data yet
  if (!currentSession) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center gap-3 text-slate-500">
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
          {error && (
            <p className="text-xs text-red-400 mt-2">{error}</p>
          )}
        </div>
      </div>
    );
  }

  return <ResearchWorkspace sessionId={id} />;
}
