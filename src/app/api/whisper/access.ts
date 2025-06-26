/**
 * Whisper APIを呼び出す関数
 */

export interface WhisperRequest {
  audio: Blob;
  lang: string;
}

export default async function access(request: WhisperRequest): Promise<string> {
  const formData = new FormData();
  formData.append("audio", request.audio, "recording.webm");
  formData.append("lang", request.lang);

  const response = await fetch("/api/whisper", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Whisper APIエラー: ${response.status}`);
  }

  const data = await response.json();
  return data.text;
}
