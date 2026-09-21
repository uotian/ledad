export type Status =
  | "idle"
  | "requesting"
  | "connecting"
  | "listening";

export const LANGS = ["en", "ja", "zh", "fr"] as const;

export type Lang = (typeof LANGS)[number];

export const TEXT_SIZES = ["S", "M", "L"] as const;

export type TextSize = (typeof TEXT_SIZES)[number];

export type Settings = {
  textSize: TextSize;
  langFrom: Lang;
  langTo: Lang;
  prompt: string;
  keywords: string[];
};

export type Item = {
  id: string;
  transcript: string;
  translation: string;
  status?: "draft" | "final";
  startedAt?: string;
  endedAt?: string;
};

export type RealtimeEvent = {
  event_id?: string;
  item_id?: string;
  content_index?: number;
  obfuscation?: string;
  type?: string;
  delta?: string;
  transcript?: string;
  error?: {
    message?: string;
  };
};
