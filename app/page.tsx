"use client";

import { QueryComposer } from "@/components/QueryComposer";
import { ResearchWorkspace } from "@/components/ResearchWorkspace";
import { useResearchStore } from "@/lib/store";

export default function Home() {
  const { currentSession } = useResearchStore();

  if (currentSession) {
    return <ResearchWorkspace />;
  }

  return (
    <main className="h-screen flex items-center justify-center">
      <QueryComposer />
    </main>
  );
}
