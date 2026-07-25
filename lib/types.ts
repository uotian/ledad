export type Status =
  | "idle"
  | "requesting"
  | "connecting"
  | "listening";

export const LANGS = ["en", "ja", "zh", "fr"] as const;

export type Lang = (typeof LANGS)[number];

export type Item = {
  id: string;
  transcript: string;
  translation: string;
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
