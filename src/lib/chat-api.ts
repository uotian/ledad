export interface ChatResponse {
  response: string;
  status: string;
}

export interface ChatError {
  error: string;
}

export interface Message {
  id: string;
  user: string;
  text: string;
  translated?: string;
  datetime: string;
  status?: "processing" | "success" | "error";
}

export async function sendChatMessage(prompt: string, sortedMessages?: Message[]): Promise<ChatResponse> {
  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt, sortedMessages }),
    });

    if (!response.ok) {
      const errorData: ChatError = await response.json();
      throw new Error(errorData.error || "チャットリクエストに失敗しました");
    }

    const data: ChatResponse = await response.json();
    return data;
  } catch (error) {
    console.error("Chat API error:", error);
    throw error;
  }
}
