// ------------------------------------------------------------
// lang1
// ------------------------------------------------------------

export const lang1Map: Record<string, string> = {
  en: "English",
  ja: "日本語",
};

export function getLang1(): string {
  if (typeof window !== "undefined") return localStorage.getItem("lang1") || Object.keys(lang1Map)[0];
  return Object.keys(lang1Map)[0];
}

export function setLang1(value: string): void {
  if (typeof window !== "undefined") localStorage.setItem("lang1", value);
}

export const lang2Map: Record<string, string> = {
  ja: "日本語",
  en: "English",
};

// ------------------------------------------------------------
// lang2
// ------------------------------------------------------------

export function getLang2(): string {
  if (typeof window !== "undefined") return localStorage.getItem("lang2") || Object.keys(lang2Map)[0];
  return Object.keys(lang2Map)[0];
}

export function setLang2(value: string): void {
  if (typeof window !== "undefined") localStorage.setItem("lang2", value);
}

// ------------------------------------------------------------
// lang common
// ------------------------------------------------------------

export const langMap: Record<string, string> = { ...lang1Map, ...lang2Map };

// ------------------------------------------------------------
// voice
// ------------------------------------------------------------

export const voiceMap: Record<string, string> = {
  alloy: "Alloy (中性的)",
  echo: "Echo (男性的)",
  fable: "Fable (物語的)",
  onyx: "Onyx (深い声)",
  nova: "Nova (女性的)",
  shimmer: "Shimmer (明るい声)",
};

export function getVoice(): string {
  if (typeof window !== "undefined") return localStorage.getItem("voice") || "alloy";
  return Object.keys(voiceMap)[0];
}

export function setVoice(value: string): void {
  if (typeof window !== "undefined") localStorage.setItem("voice", value);
}

// ------------------------------------------------------------
// messages
// ------------------------------------------------------------

export interface Message {
  id: string;
  user: number;
  text: string;
  translated?: string;
  datetime: string;
  status?: "processing" | "success" | "error";
}

export function getMessages(): Record<string, Message> {
  if (typeof window !== "undefined") return JSON.parse(localStorage.getItem("messages") || "{}");
  return {};
}

export function setMessages(messages: Record<string, Message>): void {
  if (typeof window !== "undefined") localStorage.setItem("messages", JSON.stringify(messages));
}

export function clearMessages(): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("messages", "{}");
    window.dispatchEvent(new Event("messages"));
  }
}

export function addMessage(message: Omit<Message, "id" | "datetime">): string {
  if (typeof window !== "undefined") {
    const messages = getMessages();
    const datetime = new Date().toISOString();
    const id = `${datetime}:${Math.random().toString(36).substr(2, 9)}`;
    const status = message.status || "processing";
    messages[id] = { ...message, id, datetime, status };
    setMessages(messages);
    window.dispatchEvent(new Event("messages"));
    return id;
  }
  return "";
}

export function updateMessage(id: string, updates: Partial<Message>): void {
  if (typeof window !== "undefined") {
    const messages = getMessages();
    if (messages[id]) {
      messages[id] = { ...messages[id], ...updates };
      setMessages(messages);
      window.dispatchEvent(new Event("messages"));
    }
  }
}

export function deleteMessage(id: string): boolean {
  if (typeof window !== "undefined") {
    const messages = getMessages();
    if (messages[id]) {
      delete messages[id];
      setMessages(messages);
      window.dispatchEvent(new Event("messages"));
      return true;
    }
  }
  return false;
}
