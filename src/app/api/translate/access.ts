/**
 * 翻訳APIを呼び出す関数
 */

export interface TranslateRequest {
  text: string;
  langFrom: string;
  langTo: string;
}

export default async function access(request: TranslateRequest): Promise<string> {
  const response = await fetch("/api/translate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`翻訳APIエラー: ${response.status}`);
  }

  const data = await response.json();
  return data.translatedText;
}
