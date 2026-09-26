import "server-only";
import type { Settings } from "@/lib/types";

export async function createOpenAILiveToken(apiKey: string, settings: Settings) {
  const session = {
    type: "transcription",
    audio: {
      input: {
        format: { type: "audio/pcm", rate: 24000 },
        noise_reduction: { type: "far_field" },  // Options: { type: "near_field" } (close mic) | { type: "far_field" } (laptop/conference mic) | null (off).
        transcription: {
          model: "gpt-live-transcribe",
          languages: [settings.langFrom], // Expected language hints, e.g. ["ja", "en"]. Do not also send language.
          delay: "xhigh",  // Options: "minimal" | "low" | "medium" | "high" | "xhigh".
          prompt: settings.prompt, // Optional background context; supported.
          keywords: ["ドパがき", "笑笑"],
          // keywords: settings.keywords, // Optional spelling hints, not required output; no <, >, CR, or LF.
        },
        turn_detection: null, // gpt-live-transcribe uses manual commits; server VAD is not supported.
      },
    },
  };

  const response = await fetch("https://api.openai.com/v1/realtime/client_secrets", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ expires_after: { anchor: "created_at", seconds: 60 }, session }),
  });
  if (!response.ok) throw new Error(`OpenAI token request failed (${response.status}).`);
  const token = await response.json() as { value?: string };
  if (!token.value) throw new Error("OpenAI did not return a live token.");
  return token.value;
}
