import "server-only";
import type { Lang } from "@/lib/types";
import { generate } from "./generate";

export async function translateMany(apiKey: string, langFrom: Lang, langTo: Lang, text: string) {
  const output = await generate(apiKey, {
    instructions: `Split the ${langFrom} speech transcript into natural readable segments and translate each segment into natural ${langTo}. Preserve the meaning and original order, but lightly correct obvious transcription errors when context makes the correction clear. Return each transcript segment with its corresponding translation.`,
    input: text,
    schema: translationsSchema,
  });
  const result = JSON.parse(output) as { segments?: { transcript?: string; translation?: string }[] } | null;
  if (!Array.isArray(result?.segments) || !result.segments.length || result.segments.some((segment) =>
    typeof segment?.transcript !== "string" || !segment.transcript.trim()
    || typeof segment?.translation !== "string" || !segment.translation.trim())) {
    throw new Error("Could not read translations.");
  }
  return {
    transcripts: result.segments.map((segment) => segment.transcript!.trim()),
    translations: result.segments.map((segment) => segment.translation!.trim()),
  };
}

const translationsSchema = {
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
} as const;
