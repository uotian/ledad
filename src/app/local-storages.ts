/**
 * localStorage関連の設定値を定義
 */

export interface RadioValue {
  value: string;
  label: string;
}

// メッセージの型定義
export interface Message {
  user: number;
  text: string;
  translated?: string;
  datetime: string;
}

// 言語設定の連想配列
export const lang1Map: Record<string, string> = {
  ja: "日本語",
  en: "English",
};

export const lang2Map: Record<string, string> = {
  ja: "日本語",
  en: "English",
};

// 言語設定の統合マップ
export const langMap: Record<string, string> = { ...lang1Map, ...lang2Map };

// 音声設定の連想配列
export const voiceMap: Record<string, string> = {
  alloy: "Alloy (中性的)",
  echo: "Echo (男性的)",
  fable: "Fable (物語的)",
  onyx: "Onyx (深い声)",
  nova: "Nova (女性的)",
  shimmer: "Shimmer (明るい声)",
};

// 設定値を取得する関数
export function getLang1(): string {
  if (typeof window !== "undefined") {
    return localStorage.getItem("hootalk_lang1") || "ja";
  }
  return "ja";
}

export function getLang2(): string {
  if (typeof window !== "undefined") {
    return localStorage.getItem("hootalk_lang2") || "en";
  }
  return "en";
}

export function getVoice(): string {
  if (typeof window !== "undefined") {
    return localStorage.getItem("hootalk_voice") || "alloy";
  }
  return "alloy";
}

// 設定値を保存する関数
export function setLang1(value: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("hootalk_lang1", value);
  }
}

export function setLang2(value: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("hootalk_lang2", value);
  }
}

export function setVoice(value: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("hootalk_voice", value);
  }
}

// メッセージ関連の関数
export function getMessages(): Message[] {
  if (typeof window !== "undefined") {
    return JSON.parse(localStorage.getItem("messages") || "[]");
  }
  return [];
}

export function setMessages(messages: Message[]): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("messages", JSON.stringify(messages));
  }
}

export function addMessage(message: Omit<Message, "datetime">): void {
  if (typeof window !== "undefined") {
    const messages = getMessages();
    const messageWithDateTime: Message = {
      ...message,
      datetime: new Date().toISOString(),
    };
    messages.push(messageWithDateTime);
    setMessages(messages);

    // メッセージ追加時にカスタムイベントを発火
    window.dispatchEvent(new Event("messages"));
  }
}

// メッセージを初期化する関数
export function clearMessages(): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("messages", "[]");
    // メッセージ初期化時にカスタムイベントを発火
    window.dispatchEvent(new Event("messages"));
  }
}
