import type { Settings } from "@/lib/types";

export async function translate({ text, settings }: { text: string; settings: Settings }) {
  const headers = {"Content-Type": "text/plain", "X-Lang-From": settings.langFrom, "X-Lang-To": settings.langTo};
  const response = await fetch("/api/translate/openai", {method: "POST", headers, body: text});
  const payload = await response.json();
  if (response.ok && payload.translation) {
    return payload.translation as string;
  }
  throw new Error(payload.error ?? "No translation returned.");
}

export async function translateMany({ text, settings }: { text: string; settings: Settings }) {
  const headers = {"Content-Type": "text/plain", "X-Lang-From": settings.langFrom, "X-Lang-To": settings.langTo};
  const response = await fetch("/api/translate/openai/many", {method: "POST", headers, body: text});
  const payload = await response.json();
  if (response.ok && Array.isArray(payload.transcripts) && Array.isArray(payload.translations)) {
    return { transcripts: payload.transcripts as string[], translations: payload.translations as string[] };
  }
  throw new Error(payload.error ?? "No translations returned.");
}
