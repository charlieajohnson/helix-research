import { NextRequest, NextResponse } from "next/server";
import { after } from "next/server";
import { CreateResearchRequestSchema, SessionConfigSchema } from "@/lib/types";
import {
  createResearchSession,
  executeResearchPipeline,
} from "@/lib/agent/orchestrator";
import { getRecentSessions } from "@/lib/db/queries";

export const maxDuration = 300;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = CreateResearchRequestSchema.parse(body);
    const config = SessionConfigSchema.parse(parsed.config ?? {});

    // Phase 1: Create session in DB (fast — just an INSERT)
    const sessionId = await createResearchSession(parsed.query, config);

    // Phase 2: Run pipeline in the background after response is sent
    after(async () => {
      try {
        await executeResearchPipeline(sessionId, parsed.query, config);
      } catch (err) {
        console.error(`Background pipeline failed for ${sessionId}:`, err);
      }
    });

    // Return immediately — frontend navigates to /research/[id] and polls
    return NextResponse.json(
      { id: sessionId, status: "intake" },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("POST /api/research error:", err);

    if (err?.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid request", details: err.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/research — list recent sessions for the sidebar
 */
export async function GET() {
  try {
    const sessions = await getRecentSessions(20);
    return NextResponse.json({ sessions });
  } catch (err) {
    console.error("GET /api/research error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
