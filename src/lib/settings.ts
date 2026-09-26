import { LANGS, TEXT_SIZES, TRANSCRIPTION_PROVIDERS, type Settings } from "@/lib/types";

const prompts = [
  "音声には非母語話者の発話が含まれる場合があります。",
  "一文が長くなりすぎないよう、適度に区切ること。",
];

export const defaultSettings: Settings = {
  provider: "gemini",
  textSize: "M",
  langFrom: "en",
  langTo: "ja",
  langInsight: "ja",
  prompt: prompts.join("\n"),
  keywords: [],
};

export function isSettings(value: unknown): value is Settings {
  return typeof value === "object" && value !== null
    && "provider" in value && TRANSCRIPTION_PROVIDERS.some((provider) => provider === value.provider)
    && "textSize" in value && TEXT_SIZES.some((size) => size === value.textSize)
    && "langFrom" in value && LANGS.some((lang) => lang === value.langFrom)
    && "langTo" in value && LANGS.some((lang) => lang === value.langTo)
    && "langInsight" in value && LANGS.some((lang) => lang === value.langInsight)
    && "prompt" in value && typeof value.prompt === "string"
    && "keywords" in value && Array.isArray(value.keywords)
    && value.keywords.every((keyword: unknown) => typeof keyword === "string" && !/[<>\r\n]/.test(keyword));
}
