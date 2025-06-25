/**
 * localStorage関連の設定値を定義
 */

export interface RadioValue {
  value: string;
  label: string;
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
