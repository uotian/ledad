import type { Settings } from "@/lib/types";

export async function requestSDP({ sdp, settings }: { sdp: string; settings: Settings }) {
  const headers = {"Content-Type": "application/json"};
  const response = await fetch("/api/transcribe/live", {method: "POST", headers, body: JSON.stringify({ sdp, settings })});
  if (response.ok) return response.text();
  throw new Error((await response.json()).error);
}

export async function transcribe({ audio, filename, settings }: { audio: Blob; filename: string; settings: Settings }) {
  const formData = new FormData();
  formData.set("audio", audio, filename);
  formData.set("settings", JSON.stringify(settings));
  const response = await fetch("/api/transcribe", { method: "POST", body: formData });
  if (response.ok) return (await response.json() as { transcript: string }).transcript;
  throw new Error((await response.json() as { error?: string }).error ?? "Could not transcribe audio.");
}
