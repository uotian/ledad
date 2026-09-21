import { translate } from "@/lib/translate";
import { createItemFlush } from "@/lib/items";
import type { Item, RealtimeEvent } from "@/lib/types";
import type { ItemFlushLastRef, Langs, SetError, SetItems } from "../../types";

export function onMessage(message: MessageEvent<string>, langs: Langs, itemFlushLast: ItemFlushLastRef, setError: SetError, setItems: SetItems) {
  try {
    const event = JSON.parse(message.data) as RealtimeEvent;
    if (event.type === "error") {
      setError(event.error?.message ?? "Realtime API error.");
    } else {
      const eventLog = { ...event };
      delete eventLog.item_id;
      delete eventLog.event_id;
      delete eventLog.obfuscation;
      delete eventLog.content_index;
      console.log(eventLog);
      if (event.type === "conversation.item.input_audio_transcription.delta") {
        handleDelta(event, langs, itemFlushLast, setItems);
      }
    }
  } catch {
    setError("Could not read speech event.");
  }
}

function handleDelta(event: RealtimeEvent, langs: Langs, itemFlushLast: ItemFlushLastRef, setItems: SetItems) {
  if (event.delta) {
    for (const delta of splitDelta(event.delta)) {
      const itemFlush = updateItemFlush(delta.text, itemFlushLast, setItems);
      if (itemFlush) {
        if (delta.isEnd) {
          finalizeItemFlush(itemFlushLast, langs, setItems);
        } else if (delta.shouldTranslate || event.delta === " ") {
          void updateTranslation(itemFlush, langs, itemFlushLast, setItems);
        }
      }
    }
  }
}

function splitDelta(delta: string) {
  const charsEnd = [".", "。", "?", "？", "!", "！"];
  const charsTranslate = [...charsEnd, ",", "、"];
  const deltas: { text: string; isEnd: boolean; shouldTranslate: boolean }[] = [];
  let text = "";
  for (const char of delta) {
    text += char;
    if (charsTranslate.includes(char)) {
      const isEnd = charsEnd.includes(char);
      deltas.push({text, isEnd: isEnd, shouldTranslate: true});
      text = "";
    }
  }
  if (text) deltas.push({text, isEnd: false, shouldTranslate: false});
  return deltas;
}

function updateItemFlush(delta: string, itemFlushLast: ItemFlushLastRef, setItems: SetItems) {
  const itemFlushCurrent = itemFlushLast.current;
  const itemFlushNew = itemFlushCurrent
    ? { ...itemFlushCurrent, transcript: itemFlushCurrent.transcript + delta }
    : createItemFlush({ id: crypto.randomUUID(), startedAt: new Date().toISOString(), transcript: delta });

  itemFlushLast.current = itemFlushNew;
  setItems((items) => {
    if (!items.some((item) => item.id === itemFlushNew.id)) return [...items, itemFlushNew];
    return items.map((item) => (item.id === itemFlushNew.id ? itemFlushNew : item));
  });
  return itemFlushNew;
}

export function finalizeItemFlush(itemFlushLast: ItemFlushLastRef, langs: Langs, setItems: SetItems) {
  const itemFlush = itemFlushLast.current;
  if (itemFlush) {
    const itemFlushEnded = { ...itemFlush, endedAt: new Date().toISOString() };
    itemFlushLast.current = null;
    setItems((items) => items.map((item) => item.id === itemFlushEnded.id ? itemFlushEnded : item));
    void updateTranslation(itemFlushEnded, langs, itemFlushLast, setItems);
  }
}

export async function updateTranslation(item: Item, langs: Langs, itemFlushLast: ItemFlushLastRef, setItems: SetItems) {
  const translation = await translate({ langFrom: langs.from, langTo: langs.to, text: item.transcript });
  if (translation !== null) {
    if (item.type === "flush" && itemFlushLast.current?.id === item.id) {
      itemFlushLast.current = { ...itemFlushLast.current, translation };
    }
    setItems((itemsCurrent) =>
      itemsCurrent.map((itemCurrent) =>
        itemCurrent.id === item.id ? { ...itemCurrent, translation } : itemCurrent,
      ),
    );
  }
}
