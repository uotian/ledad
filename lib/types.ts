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

type ItemBase<Texts extends string[]> = {
  id: string;
  startedAt: string;
  transcripts: Texts;
  translations: Texts;
};

export type ItemFlush = ItemBase<[string]> & {
  type: "flush";
  endedAt?: string;
};

export type ItemFinal = ItemBase<string[]> & {
  type: "final";
  endedAt: string;
};

export type Item = ItemFlush | ItemFinal;

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
