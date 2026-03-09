import { NextRequest, NextResponse } from "next/server";
import { executeResearchPipeline } from "@/lib/agent/orchestrator";
import { getSession } from "@/lib/db/queries";

export const maxDuration = 300; // 5 minutes

/**
 * POST /api/research/[id]/execute
 * Runs the research pipeline for a given session.
 * This endpoint is called internally by the main POST route
 * to decouple session creation from pipeline execution.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Verify the session exists and is in a startable state
  const session = await getSession(id);
  if (!session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  if (session.status !== "intake") {
    return NextResponse.json(
      { error: "Session already started", status: session.status },
      { status: 409 }
    );
  }

  const config = session.config as any;

  // Execute the pipeline — this blocks until complete
  await executeResearchPipeline(id, session.query, config);

  return NextResponse.json({ status: "complete" });
}
