import type { Settings } from "@/lib/types";

export async function requestSDP({ sdp, settings }: { sdp: string; settings: Settings }) {
  const headers = {"Content-Type": "application/json"};
  const response = await fetch("/api/transcribe/live", {method: "POST", headers, body: JSON.stringify({ sdp, settings })});
  if (response.ok) return response.text();
  throw new Error((await response.json()).error);
}

export async function transcribe({ audio, settings }: { audio: Blob; settings: Settings }) {
  const formData = new FormData();
  formData.set("audio", audio, `transcript.${audioExtension(audio.type)}`);
  formData.set("settings", JSON.stringify(settings));
  const response = await fetch("/api/transcribe", { method: "POST", body: formData });
  if (response.ok) return (await response.json() as { transcript: string }).transcript;
  throw new Error((await response.json() as { error?: string }).error ?? "Could not transcribe audio.");
}

function audioExtension(type: string) {
  const extensions: Record<string, string> = {
    "audio/flac": "flac",
    "audio/mp4": "mp4",
    "audio/mpeg": "mp3",
    "audio/ogg": "ogg",
    "audio/wav": "wav",
    "audio/webm": "webm",
    "audio/x-wav": "wav",
  };
  const mimeType = type.split(";")[0].toLowerCase();
  const extension = extensions[mimeType];
  if (extension) return extension;
  throw new Error(`Unsupported audio type: ${type || "unknown"}`);
}
