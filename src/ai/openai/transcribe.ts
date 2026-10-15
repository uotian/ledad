import "server-only";
import OpenAI from "openai";
import type { Settings } from "@/lib/types";

export async function transcribe(apiKey: string, audio: File, settings: Settings) {
  const openai = new OpenAI({ apiKey });
  // The installed SDK types predate GPT-Transcribe's language and keyword hints.
  const input = {
    file: audio,
    model: "gpt-transcribe",
    languages: [settings.langFrom],
    keywords: settings.keywords,
    prompt: settings.prompt || undefined,
  };
  const response = await openai.audio.transcriptions.create(input);
  return response.text.trim();
}
