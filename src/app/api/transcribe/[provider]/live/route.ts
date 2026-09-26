import { NextResponse } from "next/server";
import { notFound } from "next/navigation";
import { createOpenAILiveToken as openai } from "@/ai/openai/transcribe-live";
import { createGeminiLiveToken as gemini } from "@/ai/gemini/transcribe-live";
import { isSettings } from "@/lib/settings";

export async function POST(request: Request, { params }: { params: Promise<{ provider: string }> }) {
  const { provider } = await params;
  const createLiveToken = new Map([["openai", openai], ["gemini", gemini]]).get(provider);
  if (!createLiveToken) notFound();
  const apiKey = process.env[`${provider.toUpperCase()}_API_KEY`];
  if (!apiKey) return NextResponse.json({ error: `${provider.toUpperCase()}_API_KEY is not set. Add it to .env.local.` }, { status: 500 });
  const payload: { settings?: unknown } | null = await request.json().catch(() => null);
  const settings = payload?.settings;
  if (!isSettings(settings) || settings.provider !== provider) return NextResponse.json({ error: "Invalid transcription settings." }, { status: 400 });
  try {
    const token = await createLiveToken(apiKey, settings);
    return NextResponse.json({ token }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: 502 });
  }
}
