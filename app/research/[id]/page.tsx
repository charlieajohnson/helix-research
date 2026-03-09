"use client";

import { useEffect } from "react";
import { useResearchStore } from "@/lib/store";
import { ResearchWorkspace } from "@/components/ResearchWorkspace";
import { useParams } from "next/navigation";

export default function ResearchPage() {
  const params = useParams();
  const { currentSession, pollSession, isLoading } = useResearchStore();
  const id = params.id as string;

  useEffect(() => {
    if (id && !currentSession) {
      const poll = async () => {
        await pollSession(id);
      };
      poll();
    }
  }, [id, currentSession, pollSession]);

  // Set up polling for active sessions
  useEffect(() => {
    if (!currentSession) return;
    const status = currentSession.session.status;
    if (status === "complete" || status === "failed") return;

    const interval = setInterval(() => {
      pollSession(id);
    }, 2000);

    return () => clearInterval(interval);
  }, [currentSession, id, pollSession]);

  if (!currentSession) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-500">
          <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
          </svg>
          <span className="text-sm">Loading research session...</span>
        </div>
      </div>
    );
  }

  return <ResearchWorkspace />;
}
