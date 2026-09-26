import "server-only";
import type { Settings } from "@/lib/types";

export const GEMINI_LIVE_MODEL = "gemini-3.5-transcribe-live";

export function geminiLanguage(lang: Settings["langFrom"]) {
  return { en: "en-US", ja: "ja-JP", zh: "cmn-Hans-CN", fr: "fr-FR" }[lang];
}

export async function createGeminiLiveToken(apiKey: string, settings: Settings) {
  const response = await fetch("https://generativelanguage.googleapis.com/v1beta/auth_tokens", {
    method: "POST",
    headers: { "x-goog-api-key": apiKey, "Content-Type": "application/json" },
    body: JSON.stringify({
      uses: 1, // One session per token.
      expireTime: new Date(Date.now() + 11 * 60 * 1000).toISOString(), // Reject messages after 11 min.
      newSessionExpireTime: new Date(Date.now() + 60 * 1000).toISOString(), // Start a session within 1 min.
      bidiGenerateContentSetup: {  // Token setup overrides WebSocket setup.
        model: `models/${GEMINI_LIVE_MODEL}`,
        generationConfig: { responseModalities: ["TEXT"] }, // Return transcription as text.
        inputAudioTranscription: {
          languageCodes: [geminiLanguage(settings.langFrom)], // Speech language hint; [] auto-detects.
          customVocabulary: settings.keywords.slice(0, 1000), // Recognition hints (max 1,000 terms).
          mode: "VERBATIM", // "VERBATIM" (default) | "SMART" (removes fillers and formats text).
        },
        realtimeInputConfig: {
          automaticActivityDetection: {
            disabled: false, // false (default) | true.
            startOfSpeechSensitivity: "START_SENSITIVITY_HIGH", // "START_SENSITIVITY_HIGH" (default) | "START_SENSITIVITY_LOW".
            // prefixPaddingMs: 20, // Example; default is undocumented.
            endOfSpeechSensitivity: "END_SENSITIVITY_HIGH", // "END_SENSITIVITY_HIGH" (default) | "END_SENSITIVITY_LOW".
            silenceDurationMs: 500, // End speech after 500 ms of silence (default: about 800 ms).
          },
        },
      },
    }),
  });
  if (!response.ok) throw new Error(`Gemini token request failed (${response.status}).`);
  const token = await response.json() as { name?: string };
  if (!token.name) throw new Error("Gemini did not return a live token.");
  return token.name;
}
