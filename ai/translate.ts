import "server-only";
import OpenAI from "openai";
import type { Lang } from "@/lib/types";

export async function translate(apiKey: string, langFrom: Lang, langTo: Lang, text: string) {
  const client = new OpenAI({ apiKey });
  const response = await client.responses.create({
    model: "gpt-5.6-luna",
    instructions: `Translate ${langFrom} speech transcripts into natural ${langTo}. Return only the ${langTo} translation, with no notes or quotation marks.`,
    input: text,
    reasoning: { effort: "none" },
    store: false,
    temperature: 0,
  });
  const translation = response.output_text.trim();
  if (translation) return translation;
  throw new Error("Could not read translation.");
}
