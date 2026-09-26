import "server-only";
import type { Settings } from "@/lib/types";

export const GEMINI_LIVE_MODEL = "gemini-3.5-transcribe-live";

export function geminiLanguage(lang: Settings["langFrom"]) {
  return { en: "en-US", ja: "ja-JP", zh: "cmn-Hans-CN", fr: "fr-FR" }[lang];
}

export function geminiLiveConfig(settings: Settings) {
  return {
    generationConfig: { responseModalities: ["TEXT"] },
    inputAudioTranscription: {
      languageCodes: [geminiLanguage(settings.langFrom)],
      customVocabulary: settings.keywords.slice(0, 1000),
    },
  };
}

export async function createGeminiLiveToken(apiKey: string, settings: Settings) {
  const response = await fetch("https://generativelanguage.googleapis.com/v1beta/auth_tokens", {
    method: "POST",
    headers: { "x-goog-api-key": apiKey, "Content-Type": "application/json" },
    body: JSON.stringify({
      uses: 1,
      expireTime: new Date(Date.now() + 11 * 60 * 1000).toISOString(),
      newSessionExpireTime: new Date(Date.now() + 60 * 1000).toISOString(),
      bidiGenerateContentSetup: {
        model: `models/${GEMINI_LIVE_MODEL}`,
        ...geminiLiveConfig(settings),
      },
    }),
  });
  if (!response.ok) throw new Error(`Gemini token request failed (${response.status}).`);
  const token = await response.json() as { name?: string };
  if (!token.name) throw new Error("Gemini did not return a live token.");
  return token.name;
}
