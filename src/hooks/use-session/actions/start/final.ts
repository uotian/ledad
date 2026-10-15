import { createItemFinal } from "@/lib/items";
import { transcribe } from "@/lib/transcribe";
import { translateMany } from "@/lib/translate";
import type { Settings } from "@/lib/types";
import type { Refs, SetError, SetItems } from "../../types";

export const FINAL_INTERVAL_MS = 30 * 1000;

export class Final {
  private segment: { recorder: MediaRecorder; startedAt: string; endedAt?: string } | null = null;
  private stopped = false;

  constructor(
    private refs: Pick<Refs, "mic">,
    private settings: Settings,
    private setItems: SetItems,
    private setError: SetError,
  ) {}

  start(startedAt = new Date().toISOString()) {
    const format = "audio/webm;codecs=opus";
    const options = MediaRecorder.isTypeSupported(format) ? { mimeType: format } : undefined;
    const recorder = new MediaRecorder(this.refs.mic.current!, options);
    const filename = recorder.mimeType.startsWith("audio/mp4") ? "transcript.mp4" : "transcript.webm";
    const segment = { recorder, startedAt, endedAt: undefined as string | undefined };
    recorder.addEventListener("dataavailable", async ({ data: audio }) => {
      const { endedAt } = segment;
      try {
        if (!this.stopped && endedAt && audio.size > 0) {
          const transcript = await transcribe({ audio, filename, settings: this.settings });
          if (transcript) {
            const translated = await translateMany({ text: transcript, settings: this.settings });
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
    });
    recorder.start();
    this.segment = segment;
  }

  boundary(endedAt: string) {
    const segment = this.segment;
    if (this.stopped || !segment || segment.recorder.state !== "recording"
      || Date.parse(endedAt) - Date.parse(segment.startedAt) < FINAL_INTERVAL_MS) return;
    segment.endedAt = endedAt;
    this.start(endedAt);
    segment.recorder.stop();
  }

  stop() {
    this.stopped = true;
    if (this.segment?.recorder.state === "recording") this.segment.recorder.stop();
    this.segment = null;
  }
}
