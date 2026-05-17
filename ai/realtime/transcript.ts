import "server-only";
import type { Lang } from "@/lib/types";

export async function exchangeSDP(apiKey: string, offer: string, langFrom: Lang) {
  const body = new FormData();
  body.set("sdp", offer);
  body.set("session", JSON.stringify({
    type: "transcription",
    audio: {
      input: {
        format: {
          type: "audio/pcm",
          rate: 24000,
        },
        transcription: {
          model: "gpt-4o-transcribe",
          language: langFrom,
        },
        turn_detection: {
          type: "server_vad",
        },
      },
    },
  }));

  const response = await fetch("https://api.openai.com/v1/realtime/calls", {
    method: "POST",
    headers: {Authorization: `Bearer ${apiKey}`},
    body,
  });
  if (response.ok) return response.text();
  const message = await response.text();
  throw new Error(message || "Realtime APIへの接続に失敗しました。");
}
