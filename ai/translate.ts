import "server-only";
import OpenAI from "openai";
import type { Lang } from "@/lib/types";

export async function translate(apiKey: string, langFrom: Lang, langTo: Lang, text: string) {
  const client = new OpenAI({ apiKey });
  const response = await client.responses.create({
    model: "gpt-5.4-nano",
    input: [
      {
        role: "system",
        content: `You translate ${langFrom} speech transcripts into natural ${langTo}. Return only the ${langTo} translation, with no notes or quotation marks.`,
      },
      {
        role: "user",
        content: text,
      },
    ],
  });
  const translation = response.output_text.trim();
  if (translation) return translation;
  throw new Error("翻訳結果を読み取れませんでした。");
}
