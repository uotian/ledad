import "server-only";
import OpenAI from "openai";
import type { Lang } from "@/lib/types";

export async function translateMany(apiKey: string, langFrom: Lang, langTo: Lang, text: string) {
  const client = new OpenAI({ apiKey });
  const response = await client.responses.create({
    model: "gpt-5-nano",
    instructions: `Split the ${langFrom} speech transcript into natural readable segments and translate each segment into natural ${langTo}. Preserve the meaning and original order, but lightly correct obvious transcription errors when context makes the correction clear. Return each transcript segment with its corresponding translation.`,
    input: text,
    text: { format: translationsFormat },
    reasoning: { effort: "minimal" },
    store: false,
  });
  const { segments } = JSON.parse(response.output_text) as TranslationResult;
  const transcripts = segments.map(({ transcript }) => transcript.trim());
  const translations = segments.map(({ translation }) => translation.trim());

  if (!segments.length || transcripts.some((text) => !text) || translations.some((text) => !text)) {
    throw new Error("Could not read translations.");
  }
  return { transcripts, translations };
}

const translationsFormat = {
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
} as const;

type TranslationResult = {
  segments: { transcript: string; translation: string }[];
};
