import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getFullSession } from "@/lib/db/queries";

export const dynamic = "force-dynamic";

const PRIVATE_HEADERS = {
  "Cache-Control": "private, no-store, max-age=0",
  "X-Content-Type-Options": "nosniff",
};

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!z.string().uuid().safeParse(id).success) {
      return NextResponse.json(
        { error: "Invalid research record." },
        { status: 400, headers: PRIVATE_HEADERS }
      );
    }

    const session = await getFullSession(id);
    if (!session) {
      return NextResponse.json(
        { error: "Research record not found." },
        { status: 404, headers: PRIVATE_HEADERS }
      );
    }

    return NextResponse.json(session, { headers: PRIVATE_HEADERS });
  } catch (error) {
    console.error("GET /api/research/[id] error:", error);
    return NextResponse.json(
      { error: "The research record could not be loaded." },
      { status: 500, headers: PRIVATE_HEADERS }
    );
  }
}
