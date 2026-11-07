import "server-only";
import { ApiError, AudioTranscriptionConfigMode, EndSensitivity, GoogleGenAI, Modality, StartSensitivity } from "@google/genai";
import type { Settings } from "@/lib/types";

export const GEMINI_LIVE_MODEL = "gemini-3.5-transcribe-live";

export function geminiLanguage(lang: Settings["langFrom"]) {
  return { en: "en-US", ja: "ja-JP", zh: "cmn-Hans-CN", fr: "fr-FR" }[lang];
}

export async function createGeminiLiveToken(apiKey: string, settings: Settings) {
  // Live API and ephemeral tokens are available only on v1beta.
  const client = new GoogleGenAI({
    apiKey, apiVersion: "v1beta", vertexai: false,
    httpOptions: { baseUrl: "https://generativelanguage.googleapis.com", retryOptions: { attempts: 1 } },
  });
  const token = await client.authTokens.create({
    config: {
      uses: 1, // One session per token.
      expireTime: new Date(Date.now() + 11 * 60 * 1000).toISOString(), // Reject messages after 11 min.
      newSessionExpireTime: new Date(Date.now() + 60 * 1000).toISOString(), // Start a session within 1 min.
      liveConnectConstraints: {
        model: GEMINI_LIVE_MODEL,
        config: {
          responseModalities: [Modality.TEXT], // Return transcription as text.
          inputAudioTranscription: {
            languageCodes: [geminiLanguage(settings.langFrom)], // Speech language hint; [] auto-detects.
            customVocabulary: settings.keywords.slice(0, 1000), // Recognition hints (max 1,000 terms).
            mode: AudioTranscriptionConfigMode.VERBATIM,
          },
          realtimeInputConfig: {
            automaticActivityDetection: {
              disabled: false, // false (default) | true.
              startOfSpeechSensitivity: StartSensitivity.START_SENSITIVITY_HIGH,
              // prefixPaddingMs: 20, // Example; default is undocumented.
              endOfSpeechSensitivity: EndSensitivity.END_SENSITIVITY_HIGH,
              silenceDurationMs: 100, // End speech after 100 ms of detected non-speech.
            },
          },
        },
      },
    },
  }).catch((error: unknown) => {
    throw new Error(`Gemini token request failed${error instanceof ApiError ? ` (${error.status})` : ""}.`);
  });
  if (!token.name) throw new Error("Gemini did not return a live token.");
  return token.name;
}
