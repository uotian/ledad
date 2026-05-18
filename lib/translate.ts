import type { Lang } from "@/lib/types";

export async function translate({ langFrom, langTo, text }: { langFrom: Lang; langTo: Lang; text: string }) {
  try {
    const response = await fetch("/api/translate", {
      method: "POST",
      headers: {
        "Content-Type": "text/plain",
        "X-Lang-From": langFrom,
        "X-Lang-To": langTo,
      },
      body: text,
    });

    const payload = await response.json();
    if (response.ok && payload.translation) return payload.translation as string;
    return "翻訳失敗";
  } catch {
    return "翻訳失敗";
  }
}
