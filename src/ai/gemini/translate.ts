import "server-only";
import type { Lang } from "@/lib/types";
import { generate } from "./generate";

export async function translate(apiKey: string, langFrom: Lang, langTo: Lang, text: string) {
  return generate(apiKey, {
    instructions: `Translate ${langFrom} speech transcripts into natural ${langTo}. Return only the ${langTo} translation, with no notes or quotation marks.`,
    input: text,
  });
}
