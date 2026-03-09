import { NextRequest, NextResponse } from "next/server";
import { CreateResearchRequestSchema, SessionConfigSchema } from "@/lib/types";
import { runResearchSession } from "@/lib/agent/orchestrator";
import { getSession } from "@/lib/db/queries";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = CreateResearchRequestSchema.parse(body);

    const config = SessionConfigSchema.parse(parsed.config ?? {});

    // Fire and forget — the pipeline runs in the background
    // We return the session ID immediately so the frontend can poll
    const sessionId = await runResearchSession(parsed.query, config);

    const session = await getSession(sessionId);

    return NextResponse.json(
      {
        id: sessionId,
        status: session?.status ?? "planning",
      },
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
