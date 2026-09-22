import "server-only";
import OpenAI from "openai";
import type { Settings } from "@/lib/types";

export async function transcribe(apiKey: string, audio: File, settings: Settings) {
  const openai = new OpenAI({ apiKey });
  const response = await openai.audio.transcriptions.create({
    file: audio,
    model: "gpt-transcribe",
    language: settings.langFrom,
    prompt: settings.prompt || undefined,
  });
  return response.text.trim();
}
