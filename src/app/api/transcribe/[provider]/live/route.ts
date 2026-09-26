import { NextResponse } from "next/server";
import { createOpenAILiveToken } from "@/ai/openai/transcribe-live";
import { isSettings } from "@/lib/settings";

export async function POST(request: Request, { params }: { params: Promise<{ provider: string }> }) {
  const { provider } = await params;
  if (provider !== "openai") return NextResponse.json({ error: "Unknown transcription provider." }, { status: 404 });
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return NextResponse.json({ error: `${provider.toUpperCase()}_API_KEY is not set. Add it to .env.local.` }, { status: 500 });
  const payload: { settings?: unknown } | null = await request.json().catch(() => null);
  const settings = payload?.settings;
  if (!isSettings(settings) || settings.provider !== provider) return NextResponse.json({ error: "Invalid transcription settings." }, { status: 400 });
  try {
    const token = await createOpenAILiveToken(apiKey, settings);
    return NextResponse.json({ token }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: 502 });
  }
}
