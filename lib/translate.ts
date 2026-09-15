import type { Lang } from "@/lib/types";

export async function translate({ langFrom, langTo, text }: { langFrom: Lang; langTo: Lang; text: string }) {
  let translation: string | null = null;
  if (text.trim()) {
    const headers = {"Content-Type": "text/plain", "X-Lang-From": langFrom, "X-Lang-To": langTo};
    try {
      const response = await fetch("/api/translate", {method: "POST", headers, body: text});
      const payload = await response.json();
      if (response.ok && payload.translation) {
        translation = payload.translation as string;
      } else {
        console.error("Translation API error", { status: response.status, error: payload.error ?? "No translation returned." });
      }
    } catch (error) {
      console.error("Translation request failed", error);
    }
  }
  return translation;
}
