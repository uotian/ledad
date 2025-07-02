export interface Request {
  audio: Blob;
  lang: string;
}

export default async function access(timestamp: number, request: Request): Promise<Array<{ start: number; text: string }>> {
  try {
    const formData = new FormData();
    formData.append("audio", request.audio, "recording.webm");
    formData.append("lang", request.lang);
    const response = await fetch("/api/whisper", {
      method: "POST",
      body: formData,
    });
    if (!response.ok) return [{ start: timestamp, text: "音声認識に失敗しました" }];
    const { results } = await response.json();
    if (!results) return [{ start: timestamp, text: "音声認識結果が取得できませんでした" }];

    const results2: Array<{ start: number; text: string }> = [];
    for (const result of results) {
      result.start = timestamp + result.start;
      results2.push(result);
    }

    // 各要素のtextを取得して"\n"で結合
    const combinedText = results2.map((result: { start: number; text: string }) => result.text).join("\n");
    console.log("結合されたテキスト:", combinedText);

    return results2;
  } catch (error) {
    console.error("Whisper API呼び出しエラー:", error);
    return [{ start: timestamp, text: "音声認識に失敗しました" }];
  }
}
