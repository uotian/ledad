import type { ItemFinal, ItemFlush } from "@/lib/types";

export function createItemFlush({ id, startedAt, transcript }: { id: string; startedAt: string; transcript: string }): ItemFlush {
  return { id, startedAt, transcript, translation: "", type: "flush" };
}

export function createItemFinal({ id, startedAt, endedAt, transcript }: { id: string; startedAt: string; endedAt: string; transcript: string }): ItemFinal {
  return { id, startedAt, endedAt, transcript, translation: "", type: "final" };
}
