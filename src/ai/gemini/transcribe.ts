import "server-only";
import type { Settings } from "@/lib/types";
import { geminiLanguage } from "./transcribe-live";

const BASE = "https://generativelanguage.googleapis.com";

export async function transcribeGemini(apiKey: string, audio: File, settings: Settings) {
  const mimeType = audio.type.startsWith("audio/mp4") ? "audio/m4a" : audio.type.split(";")[0] || "audio/webm";
  const start = await fetch(`${BASE}/upload/v1beta/files`, {
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
  if (!start.ok) throw new Error(`Gemini upload failed (${start.status}).`);
  const uploadUrl = start.headers.get("x-goog-upload-url");
  if (!uploadUrl || new URL(uploadUrl).protocol !== "https:" || !new URL(uploadUrl).hostname.endsWith(".googleapis.com")) {
    throw new Error("Gemini did not return a secure upload URL.");
  }

  const upload = await fetch(uploadUrl, {
    method: "POST",
    headers: {
      "Content-Length": String(audio.size),
      "X-Goog-Upload-Offset": "0",
      "X-Goog-Upload-Command": "upload, finalize",
    },
    body: audio,
  });
  if (!upload.ok) throw new Error(`Gemini upload failed (${upload.status}).`);
  const uploaded = await upload.json() as { file?: { name?: string; uri?: string } };
  if (!uploaded.file?.uri) throw new Error("Gemini did not return an audio URI.");

  try {
    const response = await fetch(`${BASE}/v1beta/interactions`, {
      method: "POST",
      headers: { "x-goog-api-key": apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gemini-3.5-transcribe",
        input: [{ type: "audio", uri: uploaded.file.uri, mime_type: mimeType }],
        generation_config: {
          transcription_config: {
            language_codes: [geminiLanguage(settings.langFrom)],
            custom_vocabulary: settings.keywords.slice(0, 1000),
          },
        },
      }),
    });
    if (!response.ok) throw new Error(`Gemini transcription failed (${response.status}).`);
    const result = await response.json() as {
      output_text?: string;
      outputText?: string;
      steps?: { type?: string; content?: { type?: string; text?: string }[] }[];
    };
    const text = result.output_text ?? result.outputText
      ?? result.steps?.filter((step) => step.type === "model_output").flatMap((step) => step.content ?? [])
        .filter((content) => content.type === "text").map((content) => content.text ?? "").join("");
    if (typeof text !== "string") throw new Error("Gemini did not return a transcript.");
    return text.trim();
  } finally {
    if (uploaded.file.name?.startsWith("files/")) {
      await fetch(`${BASE}/v1beta/${uploaded.file.name}`, { method: "DELETE", headers: { "x-goog-api-key": apiKey } }).catch(() => undefined);
    }
  }
}
