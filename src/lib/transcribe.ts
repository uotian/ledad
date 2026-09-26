import type { Settings } from "@/lib/types";

export async function requestLiveToken(settings: Settings, signal?: AbortSignal) {
  const response = await fetch(`/api/transcribe/${settings.provider}/live`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ settings }),
    signal,
  });
  const payload = await response.json() as { token?: string; error?: string };
  if (!response.ok || !payload.token) throw new Error(payload.error ?? "Could not create a live session.");
  return payload.token;
}

export async function transcribe({ audio, filename, settings }: { audio: Blob; filename: string; settings: Settings }) {
  const formData = new FormData();
  formData.set("audio", audio, filename);
  formData.set("settings", JSON.stringify(settings));
  const response = await fetch(`/api/transcribe/${settings.provider}`, { method: "POST", body: formData });
  if (response.ok) return (await response.json() as { transcript: string }).transcript;
  throw new Error((await response.json() as { error?: string }).error ?? "Could not transcribe audio.");
}
