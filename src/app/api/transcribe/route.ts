import { NextResponse } from "next/server";
import { transcribe } from "@/ai/transcribe";
import { isSettings } from "@/lib/settings";
import type { Settings } from "@/lib/types";

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "OPENAI_API_KEY is not set. Add it to .env.local." }, { status: 500 });

  const formData = await request.formData().catch(() => null);
  const audio = formData?.get("audio");
  const settings = readSettings(formData?.get("settings"));
  if (!isAudioFile(audio)) return NextResponse.json({ error: "No audio to transcribe." }, { status: 400 });
  if (!settings) return NextResponse.json({ error: "Invalid transcription settings." }, { status: 400 });

  try {
    const transcript = await transcribe(apiKey, audio, settings);
    return NextResponse.json({ transcript });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: 502 });
  }
}

function readSettings(value: FormDataEntryValue | null | undefined): Settings | null {
  if (typeof value !== "string") return null;
  try {
    const settings: unknown = JSON.parse(value);
    return isSettings(settings) ? settings : null;
  } catch {
    return null;
  }
}

function isAudioFile(value: FormDataEntryValue | null | undefined): value is File {
  return typeof value === "object" && value !== null
    && "size" in value && typeof value.size === "number" && value.size > 0
    && "arrayBuffer" in value && typeof value.arrayBuffer === "function";
}
