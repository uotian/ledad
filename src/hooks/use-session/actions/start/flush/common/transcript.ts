import { createItemFlush } from "@/lib/items";
import { translate } from "@/lib/translate";
import type { ItemFlush, Settings } from "@/lib/types";
import type { ItemFlushLastRef, SetItems } from "@/hooks/use-session/types";

export class Transcript {
  private translations = new Map<string, { item: ItemFlush }>();

  constructor(protected last: ItemFlushLastRef, private settings: Settings, private setItems: SetItems) {}

  replace(text: string) {
    const current = this.last.current;
    const item = current
      ? { ...current, transcripts: [text] }
      : createItemFlush({ id: crypto.randomUUID(), startedAt: new Date().toISOString(), transcript: text });
    this.last.current = item;
    this.setItems((items) => items.some((existing) => existing.id === item.id)
      ? items.map((existing) => existing.id === item.id ? item : existing)
      : [...items, item]);
  }

  endSentence() {
    const item = this.last.current;
    if (item) {
      this.last.current = null;
      const finished = { ...item, endedAt: new Date().toISOString() };
      this.setItems((items) => items.map((existing) => existing.id === item.id ? finished : existing));
      void this.translate(finished);
    }
  }

  stop() {
    this.translations.clear();
  }

  async translate(item: ItemFlush | null = this.last.current) {
    if (!item?.transcripts[0].trim()) return;
    const running = this.translations.get(item.id);
    if (running) {
      running.item = item;
      return;
    }
    const state = { item };
    this.translations.set(item.id, state);
    while (this.translations.get(item.id) === state) {
      const current = state.item;
      try {
        const translation = await translate({ text: current.transcripts[0], settings: this.settings, previous: current.translations[0] });
        if (this.translations.get(item.id) !== state) return;
        if (this.last.current?.id === item.id) {
          this.last.current = { ...this.last.current, translations: [translation] };
        }
        this.setItems((items) => items.map((existing) => existing.id === item.id ? { ...existing, translations: [translation] } : existing));
        // The next request uses the translation just displayed, with the latest source.
        if (state.item !== current) state.item = { ...state.item, translations: [translation] };
      } catch (error) {
        console.error("Could not translate flush item.", error);
      }
      if (state.item.transcripts[0] === current.transcripts[0]
        || (!state.item.endedAt && this.last.current?.id !== item.id)) break;
    }
    if (this.translations.get(item.id) === state) this.translations.delete(item.id);
  }
}
