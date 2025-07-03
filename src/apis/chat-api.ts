import { Message } from "@/lib/types";

export interface Request {
  response: string;
  status: string;
}

export async function sendChatMessage(
  prompt: string,
  messages?: Message[]
): Promise<Request> {
  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, messages }),
    });

    if (!response.ok)
      return { response: "チャットに失敗しました", status: "error" };

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Chat API error:", error);
    throw error;
  }
}
