import type { Lang } from "@/lib/types";

export async function transcribeFinal({ audio, language, prompt }: { audio: Blob; language: Lang; prompt: string }) {
  const formData = new FormData();
  formData.set("audio", audio, "final-transcript.webm");
  formData.set("language", language);
  formData.set("prompt", prompt);
  const response = await fetch("/api/final-transcript", { method: "POST", body: formData });
  if (response.ok) return (await response.json() as { transcript: string }).transcript;
  throw new Error((await response.json() as { error?: string }).error ?? "Could not create final transcript.");
}
