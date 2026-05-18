import { translate } from "@/lib/translate";
import type { Item, RealtimeEvent } from "@/lib/types";
import type { ItemLastRef, Langs, SetError, SetItems } from "../../types";

export function onMessage(message: MessageEvent<string>, langs: Langs, itemLast: ItemLastRef, setError: SetError, setItems: SetItems) {
  try {
    const event = JSON.parse(message.data) as RealtimeEvent;
    if (event.type === "error") {
      setError(event.error?.message ?? "Realtime APIでエラーが発生しました。");
    } else if (event.type === "conversation.item.input_audio_transcription.delta") {
      console.log(event)
      handleDelta(event, langs, itemLast, setItems);
    }
  } catch {
    setError("音声認識イベントの読み取りに失敗しました。");
  }
}

function handleDelta(event: RealtimeEvent, langs: Langs, itemLast: ItemLastRef, setItems: SetItems) {
  if (event.delta) {
    for (const delta of splitDelta(event.delta)) {
      const item = updateTranscript(delta.text, itemLast, setItems);
      if (item) {
        if (delta.isEnd) {
          itemLast.current = null;
          void updateTranslation(item, langs, itemLast, setItems);
        } else if (delta.shouldTranslate) {
          void updateTranslation(item, langs, itemLast, setItems);
        }
      }
    }
  }
}

function splitDelta(delta: string) {
  const charsEnd = [".", "。", "?", "？", "!", "！"];
  const charsTranslate = [...charsEnd, ",", "、"];
  const deltas = [];
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

function updateTranscript(delta: string, itemLast: ItemLastRef, setItems: SetItems) {
  const itemCurrent = itemLast.current;
  const itemNew = itemCurrent
    ? { ...itemCurrent, transcript: itemCurrent.transcript + delta }
    : { id: new Date().toISOString(), transcript: delta, translation: "" };

  itemLast.current = itemNew;
  setItems((items) => {
    if (!items.some((item) => item.id === itemNew.id)) return [...items, itemNew];
    return items.map((item) => (item.id === itemNew.id ? itemNew : item));
  });
  return itemNew;
}

async function updateTranslation(item: Item, langs: Langs, itemLast: ItemLastRef, setItems: SetItems) {
  const translation = await translate({ langFrom: langs.from, langTo: langs.to, text: item.transcript });
  if (itemLast.current?.id === item.id) {
    itemLast.current = { ...itemLast.current, translation };
  }
  setItems((itemsCurrent) =>
    itemsCurrent.map((itemCurrent) =>
      itemCurrent.id === item.id ? { ...itemCurrent, translation } : itemCurrent,
    ),
  );
}
