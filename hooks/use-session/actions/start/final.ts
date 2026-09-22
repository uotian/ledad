import { createItemFinal } from "@/lib/items";
import { transcribe } from "@/lib/transcribe";
import { translateMany } from "@/lib/translate";
import type { Settings } from "@/lib/types";
import type { Langs, Refs, SetError, SetItems } from "../../types";

export const FINAL_INTERVAL_MS = 60 * 1000;

export class Final {
  private recorder: MediaRecorder | null = null;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private startedAt = "";
  private stopped = false;

  constructor(
    private refs: Pick<Refs, "mic">,
    private settings: Settings,
    private langs: Langs,
    private setItems: SetItems,
    private setError: SetError,
  ) {}

  start() {
    this.startedAt = new Date().toISOString();
    this.recorder = this.createRecorder();
    this.recorder.start();
    this.schedule();
  }

  stop() {
    this.stopped = true;
    if (this.timer) clearTimeout(this.timer);
    this.timer = null;
    if (this.recorder?.state === "recording") this.recorder.stop();
    this.recorder = null;
  }

  private createRecorder() {
    const format = "audio/webm;codecs=opus";
    return new MediaRecorder(this.refs.mic.current!, MediaRecorder.isTypeSupported(format) ? { mimeType: format } : undefined);
  }

  private schedule() {
    this.timer = setTimeout(() => this.rotate(), FINAL_INTERVAL_MS);
  }

  private rotate() {
    const recorder = this.recorder;
    if (!recorder || recorder.state !== "recording") return;

    const startedAt = this.startedAt;
    const nextRecorder = this.createRecorder();
    nextRecorder.start();
    const endedAt = new Date().toISOString();
    this.startedAt = endedAt;
    this.recorder = nextRecorder;
    this.schedule();

    recorder.addEventListener("dataavailable", (event) => {
      if (!this.stopped) void this.save(event.data, startedAt, endedAt);
    });
    recorder.stop();
  }

  private async save(audio: Blob, startedAt: string, endedAt: string) {
    try {
      if (audio.size > 0 && !this.stopped) {
        const transcript = await transcribe({ audio, settings: this.settings });
        if (transcript) {
          const translated = await translateMany({ langFrom: this.langs.from, langTo: this.langs.to, text: transcript });
          const itemFinal = createItemFinal({ id: crypto.randomUUID(), startedAt, endedAt, ...translated });
          this.setItems((items) => [...items, itemFinal]);
        }
      }
    } catch (error) {
      if (!this.stopped) {
        const message = error instanceof Error ? error.message : String(error);
        console.error("[final:error]", { startedAt, endedAt, size: audio.size, type: audio.type, message });
        this.setError(`Could not create final version: ${message}`);
      }
    }
  }
}
