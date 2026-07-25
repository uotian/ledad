import "server-only";
import type { Lang } from "@/lib/types";

export async function exchangeSDP(apiKey: string, offer: string, langFrom: Lang) {
  const body = new FormData();
  body.set("sdp", offer);
  body.set("session", JSON.stringify({
    type: "transcription",
    audio: {
      input: {
        // format: { type: "audio/pcm", rate: 24000 },
        noise_reduction: { type: "far_field" },
        transcription: {
          model: "gpt-realtime-whisper",
          language: langFrom,
          // delay: "minimal",
          // prompt: "Expect words related to international news.", // Not supported with gpt-realtime-whisper.
        },
        // turn_detection: { type: "server_vad" }, // Not supported with gpt-realtime-whisper.
      },
    },
  }));

  const headers = {Authorization: `Bearer ${apiKey}`};
  const response = await fetch("https://api.openai.com/v1/realtime/calls", {method: "POST", headers, body});
  if (response.ok) return response.text();
  throw new Error((await response.text()) || "Could not connect to Realtime API.");
}
