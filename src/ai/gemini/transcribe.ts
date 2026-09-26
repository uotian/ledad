import "server-only";
import type { Settings } from "@/lib/types";
import { geminiLanguage } from "./transcribe-live";

const BASE = "https://generativelanguage.googleapis.com";

export async function transcribeGemini(apiKey: string, audio: File, settings: Settings) {
  const mimeType = audio.type.startsWith("audio/mp4") ? "audio/m4a" : audio.type.split(";")[0] || "audio/webm";
  const uploadUrl = await start(apiKey, audio, mimeType);
  const uploaded = await upload(uploadUrl, audio);
  try {
    return await transcribeAudio(apiKey, uploaded.uri, mimeType, settings);
  } finally {
    if (uploaded.name?.startsWith("files/")) {
      await deleteAudio(apiKey, uploaded.name);
    }
  }
}

async function start(apiKey: string, audio: File, mimeType: string) {
  const response = await fetch(`${BASE}/upload/v1beta/files`, {
    method: "POST",
    headers: {
      "x-goog-api-key": apiKey,
      "X-Goog-Upload-Protocol": "resumable",
      "X-Goog-Upload-Command": "start",
      "X-Goog-Upload-Header-Content-Length": String(audio.size),
      "X-Goog-Upload-Header-Content-Type": mimeType,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ file: { display_name: audio.name } }),
  });
  if (!response.ok) throw new Error(`Gemini upload failed (${response.status}).`);
  const uploadUrl = response.headers.get("x-goog-upload-url");
  if (!uploadUrl || new URL(uploadUrl).protocol !== "https:" || !new URL(uploadUrl).hostname.endsWith(".googleapis.com")) {
    throw new Error("Gemini did not return a secure upload URL.");
  }
  return uploadUrl;
}

async function upload(uploadUrl: string, audio: File) {
  const response = await fetch(uploadUrl, {
    method: "POST",
    headers: {
      "Content-Length": String(audio.size),
      "X-Goog-Upload-Offset": "0",
      "X-Goog-Upload-Command": "upload, finalize",
    },
    body: audio,
  });
  if (!response.ok) throw new Error(`Gemini upload failed (${response.status}).`);
  const uploaded = await response.json() as { file?: { name?: string; uri?: string } };
  if (!uploaded.file?.uri) throw new Error("Gemini did not return an audio URI.");
  return { name: uploaded.file.name, uri: uploaded.file.uri };
}

async function transcribeAudio(apiKey: string, uri: string, mimeType: string, settings: Settings) {
  const body = {
    model: "gemini-3.5-transcribe",
    input: [{ type: "audio", uri, mime_type: mimeType }], // Uploaded audio URI and MIME type.
    generation_config: {
      transcription_config: {
        language_codes: [geminiLanguage(settings.langFrom)], // Speech language hint; [] auto-detects.
        custom_vocabulary: settings.keywords.slice(0, 1000), // Recognition hints; incompatible with speaker labels and word timestamps.
        mode: { // Verbatim (default); "smart" removes fillers and formats text.
          type: "verbatim", // Preserves fillers and repetitions.
          // diarization_mode: "speaker", // Speaker labels; incompatible with custom_vocabulary.
          // timestamp_granularities: ["word"], // Word timestamps; incompatible with custom_vocabulary.
        },
      },
    },
  };
  console.log("[gemini:transcribe:request]", JSON.stringify(body, null, 2));
  const response = await fetch(`${BASE}/v1beta/interactions`, {
    method: "POST",
    headers: { "x-goog-api-key": apiKey, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error(`Gemini transcription failed (${response.status}).`);
  const result = await response.json() as {
    steps?: { type?: string; content?: { type?: string; text?: string }[] }[];
  };
  console.log("[gemini:transcribe]", JSON.stringify(result, null, 2));
  const text = result.steps?.filter((step) => step.type === "model_output").flatMap((step) => step.content ?? [])
    .filter((content) => content.type === "text").map((content) => content.text ?? "").join("");
  if (typeof text !== "string") throw new Error("Gemini did not return a transcript.");
  return text.trim();
}

async function deleteAudio(apiKey: string, name: string) {
  await fetch(`${BASE}/v1beta/${name}`, { method: "DELETE", headers: { "x-goog-api-key": apiKey } }).catch(() => undefined);
}
