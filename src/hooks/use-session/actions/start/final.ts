import { createItemFinal } from "@/lib/items";
import { transcribe } from "@/lib/transcribe";
import { translateMany } from "@/lib/translate";
import type { Settings } from "@/lib/types";
import type { Refs, SetError, SetItems } from "../../types";

export const FINAL_INTERVAL_MS = 60 * 1000;

export class Final {
  private recorder: MediaRecorder | null = null;
  private timer: ReturnType<typeof setTimeout> | null = null;
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
    let endedAt: string | undefined;
    recorder.addEventListener("dataavailable", async ({ data: audio }) => {
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
    this.recorder = recorder;
    this.timer = setTimeout(() => {
      if (recorder.state === "recording") {
        endedAt = new Date().toISOString();
        this.start(endedAt);
        recorder.stop();
      }
    }, FINAL_INTERVAL_MS);
  }

  stop() {
    this.stopped = true;
    if (this.timer) clearTimeout(this.timer);
    this.timer = null;
    if (this.recorder?.state === "recording") this.recorder.stop();
    this.recorder = null;
  }
}
