export interface Request {
  audio: Blob;
  lang: string;
}

// ファイルサイズ制限（4MB）
const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4MB

export default async function access(
  timestamp: number,
  request: Request
): Promise<Array<{ start: number; text: string }>> {
  try {
    // ファイルサイズチェック
    if (request.audio.size > MAX_FILE_SIZE) {
      return [
        {
          start: timestamp,
          text: `音声ファイルが大きすぎます（${(request.audio.size / (1024 * 1024)).toFixed(1)}MB）。最大4MBまで対応しています。`,
        },
      ];
    }

    const formData = new FormData();
    formData.append("audio", request.audio, "recording.webm");
    formData.append("lang", request.lang);
    const response = await fetch("/api/transcribe", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error || "音声認識に失敗しました";
      return [{ start: timestamp, text: errorMessage }];
    }

    const { text } = await response.json();
    if (!text)
      return [{ start: timestamp, text: "音声認識結果が取得できませんでした" }];
    return [{ start: timestamp, text }];
  } catch (error) {
    console.error("Whisper API呼び出しエラー:", error);
    return [{ start: timestamp, text: "音声認識に失敗しました" }];
  }
}
