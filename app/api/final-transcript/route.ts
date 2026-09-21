import { NextResponse } from "next/server";
import { transcribeFinal } from "@/ai/final-transcript";
import { LANGS, type Lang } from "@/lib/types";

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "OPENAI_API_KEY is not set. Add it to .env.local." }, { status: 500 });

  const formData = await request.formData().catch(() => null);
  const audio = formData?.get("audio");
  const language = formData?.get("language");
  const prompt = formData?.get("prompt");
  if (!isAudioFile(audio)) return NextResponse.json({ error: "No audio to transcribe." }, { status: 400 });
  if (typeof language !== "string" || !LANGS.includes(language as Lang)) return NextResponse.json({ error: "Invalid transcription language." }, { status: 400 });
  if (typeof prompt !== "string") return NextResponse.json({ error: "Invalid transcription prompt." }, { status: 400 });

  try {
    const transcript = await transcribeFinal(apiKey, audio, language as Lang, prompt);
    return NextResponse.json({ transcript });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: 502 });
  }
}

function isAudioFile(value: FormDataEntryValue | null | undefined): value is File {
  return typeof value === "object" && value !== null
    && "size" in value && typeof value.size === "number" && value.size > 0
    && "arrayBuffer" in value && typeof value.arrayBuffer === "function";
}
