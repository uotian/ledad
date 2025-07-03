export interface Request {
  text: string;
  langFrom: string;
  langTo: string;
}

export default async function access(request: Request): Promise<string> {
  try {
    const response = await fetch("/api/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });
    if (!response.ok) return "翻訳に失敗しました";
    return (
      (await response.json()).translated || "翻訳結果が取得できませんでした"
    );
  } catch (error) {
    console.error("翻訳API呼び出しエラー:", error);
    return "翻訳に失敗しました";
  }
}
