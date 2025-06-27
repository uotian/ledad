export interface WhisperRequest {
  audio: Blob;
  lang: string;
}

export default async function access(request: WhisperRequest): Promise<string> {
  try {
    const formData = new FormData();
    formData.append("audio", request.audio, "recording.webm");
    formData.append("lang", request.lang);
    const response = await fetch("/api/whisper", {
      method: "POST",
      body: formData,
    });
    if (!response.ok) return "音声認識に失敗しました";
    return (await response.json()).text || "音声認識結果が取得できませんでした";
  } catch (error) {
    console.error("Whisper API呼び出しエラー:", error);
    return "音声認識に失敗しました";
  }
}
