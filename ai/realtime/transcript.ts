import "server-only";
import type { Lang } from "@/lib/types";

const prompts = [
  "音声には非母語話者の発話が含まれる場合があります。",
  "一文が長くなりすぎないよう、適度に区切ること。",
  "Mr.やU.S.などの敬称や略語はMrやUSのようにピリオドなしで表記し、ピリオドは文末だけに使用すること。",
];

export async function exchangeSDP(apiKey: string, offer: string, langFrom: Lang) {
  const body = new FormData();
  body.set("sdp", offer);
  body.set("session", JSON.stringify({
    type: "transcription",
    audio: {
      input: {
        noise_reduction: { type: "far_field" },  // Options: { type: "near_field" } (close mic) | { type: "far_field" } (laptop/conference mic) | null (off).
        transcription: {
          model: "gpt-live-transcribe",
          languages: [langFrom], // Expected language hints, e.g. ["ja", "en"]. Do not also send language.
          delay: "minimal",  // Options: "minimal" | "low" | "medium" | "high" | "xhigh".
          prompt: prompts.join(" "), // Optional background context; supported.
          keywords: [], // Optional spelling hints, not required output; no <, >, CR, or LF.
        },
        turn_detection: null, // turn_detection: { type: "server_vad" }, // Currently times out with gpt-live-transcribe.
      },
    },
  }));

  const headers = {Authorization: `Bearer ${apiKey}`};
  const response = await fetch("https://api.openai.com/v1/realtime/calls", {method: "POST", headers, body});
  if (response.ok) return response.text();
  throw new Error((await response.text()) || "Could not connect to Realtime API.");
}
