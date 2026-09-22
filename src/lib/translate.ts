import type { Lang } from "@/lib/types";

export async function translate({ langFrom, langTo, text }: { langFrom: Lang; langTo: Lang; text: string }) {
  const headers = {"Content-Type": "text/plain", "X-Lang-From": langFrom, "X-Lang-To": langTo};
  const response = await fetch("/api/translate", {method: "POST", headers, body: text});
  const payload = await response.json();
  if (response.ok && payload.translation) {
    return payload.translation as string;
  }
  throw new Error(payload.error ?? "No translation returned.");
}

export async function translateMany({ langFrom, langTo, text }: { langFrom: Lang; langTo: Lang; text: string }) {
  const headers = {"Content-Type": "text/plain", "X-Lang-From": langFrom, "X-Lang-To": langTo};
  const response = await fetch("/api/translate/many", {method: "POST", headers, body: text});
  const payload = await response.json();
  if (response.ok && Array.isArray(payload.transcripts) && Array.isArray(payload.translations)) {
    return { transcripts: payload.transcripts as string[], translations: payload.translations as string[] };
  }
  throw new Error(payload.error ?? "No translations returned.");
}
