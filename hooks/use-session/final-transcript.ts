import type { Item, Settings } from "@/lib/types";
import { transcribeFinal } from "@/lib/final-transcript";
import type { ItemLastRef, Langs, SetError, SetItems } from "./types";
import { updateTranslation } from "./actions/start/on-message";

export const FINAL_TRANSCRIPT_INTERVAL_MS = 60 * 1000;

export function replaceWithFinalTranscript(items: Item[], finalItem: Item) {
  const start = new Date(finalItem.startedAt ?? finalItem.id).getTime();
  const end = new Date(finalItem.endedAt ?? finalItem.startedAt ?? finalItem.id).getTime();
  const remaining = items.filter((item) => {
    if (item.status === "final" || !item.endedAt) return true;
    const itemEnd = new Date(item.endedAt).getTime();
    return itemEnd <= start || itemEnd > end;
  });
  return [...remaining, finalItem].sort((a, b) => (a.startedAt ?? a.id).localeCompare(b.startedAt ?? b.id));
}

export function createFinalRecorder(mic: MediaStream, settings: Settings, langs: Langs, itemLast: ItemLastRef, setItems: SetItems, setError: SetError) {
  let recorder: MediaRecorder | null = null;
  let timer: ReturnType<typeof setTimeout> | null = null;
  let stopped = false;

  const start = () => {
    if (stopped) return;
    const startedAt = new Date().toISOString();
    const chunks: BlobPart[] = [];
    recorder = new MediaRecorder(mic, MediaRecorder.isTypeSupported("audio/webm;codecs=opus") ? { mimeType: "audio/webm;codecs=opus" } : undefined);
    recorder.addEventListener("dataavailable", (event) => {
      if (event.data.size > 0) chunks.push(event.data);
    });
    const mimeType = recorder.mimeType || "audio/webm";
    recorder.addEventListener("stop", () => {
      const endedAt = new Date().toISOString();
      const audio = new Blob(chunks, { type: mimeType });
      if (audio.size > 0) void finalize(audio, startedAt, endedAt);
      if (!stopped) start();
    }, { once: true });
    recorder.start();
    timer = setTimeout(() => recorder?.state === "recording" && recorder.stop(), FINAL_TRANSCRIPT_INTERVAL_MS);
  };

  const finalize = async (audio: Blob, startedAt: string, endedAt: string) => {
    try {
      const transcript = await transcribeFinal({ audio, language: settings.langFrom, prompt: settings.prompt });
      if (!transcript) return;
      const finalItem: Item = { id: startedAt, startedAt, endedAt, transcript, translation: "", status: "final" };
      setItems((items) => replaceWithFinalTranscript(items, finalItem));
      void updateTranslation(finalItem, langs, itemLast, setItems);
    } catch (error) {
      setError(`Could not create final transcript: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  start();
  return () => {
    stopped = true;
    if (timer) clearTimeout(timer);
    if (recorder?.state === "recording") recorder.stop();
  };
}
