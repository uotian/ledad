export interface Request {
  text: string;
  voice?: string; // alloy, echo, fable, onyx, nova, shimmer
}

export interface Response {
  audio: string; // base64 encoded MP3
  text: string;
  voice: string;
  format: string;
}

export default async function access(
  request: Request
): Promise<Response | null> {
  try {
    const response = await fetch("/api/speak", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      console.error("発声APIエラー:", response.status);
      return null;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("発声API呼び出しエラー:", error);
    return null;
  }
}
