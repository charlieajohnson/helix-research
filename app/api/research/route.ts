import { after, NextRequest, NextResponse } from "next/server";
import { CreateResearchRequestSchema, SessionConfigSchema } from "@/lib/types";
import { createResearchSession, executeResearchPipeline } from "@/lib/agent/orchestrator";
import { checkResearchRateLimit } from "@/lib/rate-limit";

export const maxDuration = 300;
export const dynamic = "force-dynamic";

const PRIVATE_HEADERS = {
  "Cache-Control": "private, no-store, max-age=0",
  "X-Content-Type-Options": "nosniff",
};

export async function POST(request: NextRequest) {
  const clientKey =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "local";
  const rateLimit = checkResearchRateLimit(clientKey);

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Research limit reached. Try again shortly." },
      {
        status: 429,
        headers: { ...PRIVATE_HEADERS, "Retry-After": String(rateLimit.retryAfterSeconds) },
      }
    );
  }

  try {
    const body = await request.json();
    const parsed = CreateResearchRequestSchema.parse(body);
    const config = SessionConfigSchema.parse(parsed.config ?? {});
    const sessionId = await createResearchSession(parsed.query, config);

    after(async () => {
      try {
        await executeResearchPipeline(sessionId, parsed.query, config);
      } catch (error) {
        console.error(`Background pipeline failed for ${sessionId}:`, error);
      }
    });

    return NextResponse.json(
      { id: sessionId, status: "intake" },
      { status: 201, headers: PRIVATE_HEADERS }
    );
  } catch (error: unknown) {
    if (isZodError(error)) {
      return NextResponse.json(
        { error: error.issues[0]?.message ?? "Invalid request", details: error.issues },
        { status: 400, headers: PRIVATE_HEADERS }
      );
    }

    console.error("POST /api/research error:", error);
    return NextResponse.json(
      { error: "The research session could not be created." },
      { status: 500, headers: PRIVATE_HEADERS }
    );
  }
}

function isZodError(error: unknown): error is { issues: Array<{ message?: string }> } {
  return typeof error === "object" && error !== null && "issues" in error && Array.isArray((error as { issues?: unknown }).issues);
}
