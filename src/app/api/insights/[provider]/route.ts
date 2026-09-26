import { NextResponse } from "next/server";
import { notFound } from "next/navigation";
import { GeminiRateLimitError } from "@/ai/gemini/generate";
import { generateInsights as openai } from "@/ai/openai/insights";
import { generateInsights as gemini } from "@/ai/gemini/insights";
import { isInsightsRequest } from "@/lib/insights";

export async function POST(request: Request, { params }: { params: Promise<{ provider: string }> }) {
  const { provider } = await params;
  const generateInsights = new Map([["openai", openai], ["gemini", gemini]]).get(provider);
  if (!generateInsights) notFound();
  const apiKey = process.env[`${provider.toUpperCase()}_API_KEY`];
  if (!apiKey) return NextResponse.json({ error: `${provider.toUpperCase()}_API_KEY is not set. Add it to .env.local.` }, { status: 500 });

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
  } catch (error) {
    if (error instanceof GeminiRateLimitError) {
      const headers = error.retryAfter === undefined ? undefined : { "Retry-After": String(error.retryAfter) };
      return NextResponse.json({ error: error.message }, { status: 429, headers });
    }
    return NextResponse.json({ error: "Could not generate insights. Will retry on the next update." }, { status: 502 });
  }
}
