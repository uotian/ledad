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

export async function translateMany(apiKey: string, langFrom: Lang, langTo: Lang, text: string) {
  const client = new OpenAI({ apiKey });
  const response = await client.responses.create({
    model: "gpt-5.6-luna",
    instructions: `Split the ${langFrom} speech transcript into natural readable segments and translate each segment into natural ${langTo}. Copy all source text into the transcript fields without correcting, rewriting, omitting, or adding content. Preserve the original order and return each transcript segment with its corresponding translation.`,
    input: text,
    text: {
      format: {
        type: "json_schema",
        name: "translations",
        strict: true,
        schema: {
          type: "object",
          properties: {
            segments: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  transcript: { type: "string" },
                  translation: { type: "string" },
                },
                required: ["transcript", "translation"],
                additionalProperties: false,
              },
            },
          },
          required: ["segments"],
          additionalProperties: false,
        },
      },
    },
    reasoning: { effort: "none" },
    store: false,
    temperature: 0,
  });
  const result = JSON.parse(response.output_text) as { segments?: { transcript?: unknown; translation?: unknown }[] };
  const segments = result.segments;
  if (!Array.isArray(segments) || !segments.length) {
    throw new Error("Could not read translations.");
  }
  if (!segments.every((segment): segment is { transcript: string; translation: string } =>
    typeof segment.transcript === "string" && typeof segment.translation === "string")) throw new Error("Could not read translations.");

  const transcripts = segments.map((segment) => segment.transcript.trim());
  const translations = segments.map((segment) => segment.translation.trim());
  const normalize = (value: string) => value.replace(/\s+/g, " ").trim();
  if (transcripts.some((transcript) => !transcript)
    || translations.some((translation) => !translation)
    || normalize(transcripts.join(" ")) !== normalize(text)) throw new Error("Could not preserve transcript.");
  return { transcripts, translations };
}
