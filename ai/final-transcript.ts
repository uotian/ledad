import "server-only";
import OpenAI from "openai";
import type { Lang } from "@/lib/types";

export async function transcribeFinal(apiKey: string, audio: File, language: Lang, prompt: string) {
  const openai = new OpenAI({ apiKey });
  const response = await openai.audio.transcriptions.create({
    file: audio,
    model: "gpt-transcribe",
    language,
    prompt: prompt || undefined,
  });
  return response.text.trim();
}
