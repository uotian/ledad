export type Status =
  | "idle"
  | "requesting"
  | "connecting"
  | "listening";

export const LANGS = ["en", "ja", "zh", "fr"] as const;

export type Lang = (typeof LANGS)[number];

export const TEXT_SIZES = ["S", "M", "L"] as const;
export const TRANSCRIPTION_PROVIDERS = ["openai", "gemini"] as const;
export type TranscriptionProvider = (typeof TRANSCRIPTION_PROVIDERS)[number];

export type TextSize = (typeof TEXT_SIZES)[number];

export type Settings = {
  provider: TranscriptionProvider;
  textSize: TextSize;
  langFrom: Lang;
  langTo: Lang;
  langInsight: Lang;
  prompt: string;
  keywords: string[];
};

type ItemBase = {
  id: string;
  startedAt: string;
  transcripts: string[];
  translations: string[];
};

export type ItemFlush = ItemBase & {
  type: "flush";
  endedAt?: string;
};

export type ItemFinal = ItemBase & {
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
