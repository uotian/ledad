import { NextResponse } from "next/server";
import { notFound } from "next/navigation";
import { APIError } from "openai";
import { GeminiRateLimitError } from "@/ai/gemini/generate";
import { translate as openai } from "@/ai/openai/translate";
import { translate as gemini } from "@/ai/gemini/translate";
import { readLang } from "@/lib/request";

export async function POST(request: Request, { params }: { params: Promise<{ provider: string }> }) {
  const { provider } = await params;
  const translate = new Map([["openai", openai], ["gemini", gemini]]).get(provider);
  if (!translate) notFound();
  const apiKey = process.env[`${provider.toUpperCase()}_API_KEY`];
  if (!apiKey) return NextResponse.json({ error: `${provider.toUpperCase()}_API_KEY is not set. Add it to .env.local.` }, { status: 500 });

  const langFrom = readLang(request, "X-Lang-From", "en");
  const langTo = readLang(request, "X-Lang-To", "ja");
  const { text, previous = "" }: { text?: unknown; previous?: unknown } = await request.json().catch(() => null) ?? {};
  if (typeof text !== "string" || !text.trim() || typeof previous !== "string") {
    return NextResponse.json({ error: "Invalid translation input." }, { status: 400 });
  }

  try {
    return NextResponse.json({ translation: await translate(apiKey, langFrom, langTo, text.trim(), previous) });
  } catch (error) {
    if (error instanceof GeminiRateLimitError) {
      const headers = error.retryAfter === undefined ? undefined : { "Retry-After": String(error.retryAfter) };
      return NextResponse.json({ error: error.message }, { status: 429, headers });
    }
    return NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: error instanceof APIError ? error.status ?? 502 : 502 });
  }
}
