import type { Item, ItemFinal, ItemFlush } from "@/lib/types";

export function createItemFlush({ id, startedAt, transcript }: { id: string; startedAt: string; transcript: string }): ItemFlush {
  return { id, startedAt, transcripts: [transcript], translations: [""], type: "flush" };
}

export function createItemFinal({ id, startedAt, endedAt, transcripts, translations }: { id: string; startedAt: string; endedAt: string; transcripts: string[]; translations: string[] }): ItemFinal {
  return { id, startedAt, endedAt, transcripts, translations, type: "final" };
}

export function selectItems(items: Item[]) {
  const itemFinalLast = items
    .filter((item): item is ItemFinal => item.type === "final")
    .sort((a, b) => b.endedAt.localeCompare(a.endedAt))[0];

  return items
    .filter((item) =>
      item.type === "final"
      || !item.endedAt
      || !itemFinalLast
      || itemFinalLast.endedAt < item.endedAt,
    )
    .sort((a, b) => a.startedAt.localeCompare(b.startedAt));
}
