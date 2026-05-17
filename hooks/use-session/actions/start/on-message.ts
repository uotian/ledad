import { translate } from "@/lib/translate";
import type { Item, RealtimeEvent } from "@/lib/types";
import type { Langs, SetStates } from "../../types";

export function onMessage(message: MessageEvent<string>, langs: Langs, setStates: SetStates) {
  try {
    const event = JSON.parse(message.data) as RealtimeEvent;
    if (event.type === "error") {
      setStates.setError(event.error?.message ?? "Realtime APIでエラーが発生しました。");
    } else if (event.type === "conversation.item.input_audio_transcription.completed") {
      handleCompleted(event, langs, setStates);
    }
  } catch {
    setStates.setError("音声認識イベントの読み取りに失敗しました。");
  }
}

function handleCompleted(event: RealtimeEvent, langs: Langs, setStates: SetStates) {
  const transcript = event.transcript?.trim();
  if (transcript && event.item_id) {
    const id = `${event.event_id ?? ""}-${event.item_id}`;
    if (addItem({ id, transcript, translation: "翻訳中..." }, setStates)) {
      void (async () => {
        try {
          updateItem(id, { translation: await translate({ langFrom: langs.from, langTo: langs.to, text: transcript }) }, setStates);
        } catch {
          updateItem(id, { translation: "翻訳に失敗しました。" }, setStates);
        }
      })();
    }
  }
}

function addItem(item: Item, { setItems }: SetStates) {
  let added = true;
  setItems((itemsCurrent) => {
    if (itemsCurrent.some((itemCurrent) => itemCurrent.id === item.id)) {
      added = false;
      return itemsCurrent;
    }
    return [...itemsCurrent, item];
  });
  return added;
}

function updateItem(id: string, item: Partial<Omit<Item, "id">>, { setItems }: SetStates) {
  setItems((itemsCurrent) =>
    itemsCurrent.map((itemCurrent) =>
      itemCurrent.id === id ? { ...itemCurrent, ...item } : itemCurrent,
    ),
  );
}
