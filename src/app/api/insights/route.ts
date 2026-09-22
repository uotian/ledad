import { NextResponse } from "next/server";
import { generateInsights } from "@/ai/insights";
import { isInsightsRequest } from "@/lib/insights";

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "OPENAI_API_KEY is not set. Add it to .env.local." }, { status: 500 });

  const text = await request.text();
  if (new TextEncoder().encode(text).length > 512_000) {
    return NextResponse.json({ error: "Transcript is too large to summarize." }, { status: 413 });
  }
  let input: unknown;
  try {
    input = JSON.parse(text);
  } catch {
    return NextResponse.json({ error: "Invalid insights request." }, { status: 400 });
  }
  if (!isInsightsRequest(input)) return NextResponse.json({ error: "Invalid insights request." }, { status: 400 });

  try {
    return NextResponse.json(await generateInsights(apiKey, input, request.signal));
  } catch {
    return NextResponse.json({ error: "Could not generate insights. Will retry on the next update." }, { status: 502 });
  }
}
