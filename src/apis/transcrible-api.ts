export interface Request {
  audio: Blob;
  lang: string;
}

export default async function access(timestamp: number, request: Request): Promise<Array<{ start: number; text: string }>> {
  try {
    const formData = new FormData();
    formData.append("audio", request.audio, "recording.webm");
    formData.append("lang", request.lang);
    const response = await fetch("/api/transcribe", {
      method: "POST",
      body: formData,
    });
    if (!response.ok) return [{ start: timestamp, text: "音声認識に失敗しました" }];
    const { text } = await response.json();
    if (!text) return [{ start: timestamp, text: "音声認識結果が取得できませんでした" }];
    return [{ start: timestamp, text }];
  } catch (error) {
    console.error("Whisper API呼び出しエラー:", error);
    return [{ start: timestamp, text: "音声認識に失敗しました" }];
  }
}
