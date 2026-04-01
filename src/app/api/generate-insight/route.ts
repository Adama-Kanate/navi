import { NextRequest, NextResponse } from "next/server";
import { generateInsight } from "@/lib/insight-engine";

type InsightProfilePayload = {
  currentStatus?: string | null;
  targetDecision?: string | null;
  deadlineWindow?: string | null;
  stuckLevel?: number | null;
  constraints?: string[] | null;
};

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as InsightProfilePayload;

    const result = await generateInsight(body || {});

    return NextResponse.json(result, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON payload." },
      { status: 400 }
    );
  }
}
