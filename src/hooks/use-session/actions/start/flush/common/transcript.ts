import { createItemFlush } from "@/lib/items";
import { translate } from "@/lib/translate";
import type { ItemFlush, Settings } from "@/lib/types";
import type { ItemFlushLastRef, SetItems } from "@/hooks/use-session/types";

export class Transcript {
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

  async translate(item: ItemFlush | null = this.last.current) {
    if (item && item.transcripts[0].trim()) {
      const text = item.transcripts[0];
      try {
        const translation = await translate({ text, settings: this.settings });
        if (this.last.current?.id === item.id) {
          this.last.current = { ...this.last.current, translations: [translation] };
        }
        this.setItems((items) => items.map((existing) => existing.id === item.id ? { ...existing, translations: [translation] } : existing));
      } catch (error) {
        console.error("Could not translate flush item.", error);
      }
    }
  }
}
