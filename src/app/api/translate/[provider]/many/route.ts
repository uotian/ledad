import { NextResponse } from "next/server";
import { notFound } from "next/navigation";
import { GeminiRateLimitError } from "@/ai/gemini/generate";
import { translateMany as openai } from "@/ai/openai/translate-many";
import { translateMany as gemini } from "@/ai/gemini/translate-many";
import { readLang } from "@/lib/request";

export async function POST(request: Request, { params }: { params: Promise<{ provider: string }> }) {
  const { provider } = await params;
  const translateMany = new Map([["openai", openai], ["gemini", gemini]]).get(provider);
  if (!translateMany) notFound();
  const apiKey = process.env[`${provider.toUpperCase()}_API_KEY`];
  if (!apiKey) return NextResponse.json({ error: `${provider.toUpperCase()}_API_KEY is not set. Add it to .env.local.` }, { status: 500 });

  const langFrom = readLang(request, "X-Lang-From", "en");
  const langTo = readLang(request, "X-Lang-To", "ja");
  const text = (await request.text()).trim();
  if (!text) return NextResponse.json({ error: "No text to translate." }, { status: 400 });

  try {
    return NextResponse.json(await translateMany(apiKey, langFrom, langTo, text));
  } catch (error) {
    if (error instanceof GeminiRateLimitError) {
      const headers = error.retryAfter === undefined ? undefined : { "Retry-After": String(error.retryAfter) };
      return NextResponse.json({ error: error.message }, { status: 429, headers });
    }
    return NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: 502 });
  }
}
