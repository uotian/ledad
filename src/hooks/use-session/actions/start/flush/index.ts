import type { Settings } from "@/lib/types";
import type { ItemFlushLastRef, Refs, SetItems, SetStatus } from "@/hooks/use-session/types";
import { Flush as OpenAIFlush } from "./openai";

export type Flush = OpenAIFlush;

export function createFlush(refs: Pick<Refs, "mic" | "flush">, settings: Settings, itemFlushLast: ItemFlushLastRef, setStatus: SetStatus, onError: (message: string) => void, setItems: SetItems): Flush {
  const Flush = OpenAIFlush;
  return new Flush(refs, settings, itemFlushLast, setStatus, onError, setItems);
}
