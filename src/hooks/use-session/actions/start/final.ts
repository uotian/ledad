import { createItemFinal } from "@/lib/items";
import { transcribe } from "@/lib/transcribe";
import { translateMany } from "@/lib/translate";
import type { Settings } from "@/lib/types";
import type { Langs, Refs, SetError, SetItems } from "../../types";

export const FINAL_INTERVAL_MS = 60 * 1000;

export class Final {
  private recording: Recording | null = null;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private stopped = false;

  constructor(
    private refs: Pick<Refs, "mic">,
    private settings: Settings,
    private langs: Langs,
    private setItems: SetItems,
    private setError: SetError,
  ) {}

  start() {
    this.recording = this.startRecording();
    this.schedule();
  }

  stop() {
    this.stopped = true;
    if (this.timer) clearTimeout(this.timer);
    this.timer = null;
    if (this.recording) this.endRecording(this.recording, new Date().toISOString());
    this.recording = null;
  }

  private startRecording() {
    const format = "audio/webm;codecs=opus";
    const recorder = new MediaRecorder(this.refs.mic.current!, MediaRecorder.isTypeSupported(format) ? { mimeType: format } : undefined);
    const recording: Recording = { recorder, startedAt: new Date().toISOString() };
    recorder.addEventListener("dataavailable", (event) => {
      if (!this.stopped && recording.endedAt) {
        const filename = recorder.mimeType.startsWith("audio/mp4") ? "transcript.mp4" : "transcript.webm";
        void this.save(event.data, filename, recording.startedAt, recording.endedAt);
      }
    });
    recorder.start();
    return recording;
  }

  private endRecording(recording: Recording, endedAt: string) {
    recording.endedAt = endedAt;
    if (recording.recorder.state === "recording") recording.recorder.stop();
  }

  private schedule() {
    this.timer = setTimeout(() => this.rotate(), FINAL_INTERVAL_MS);
  }

  private rotate() {
    const recording = this.recording;
    if (!recording || recording.recorder.state !== "recording") return;

    this.recording = this.startRecording();
    this.schedule();
    this.endRecording(recording, this.recording.startedAt);
  }

  private async save(audio: Blob, filename: string, startedAt: string, endedAt: string) {
    try {
      if (audio.size > 0 && !this.stopped) {
        const transcript = await transcribe({ audio, filename, settings: this.settings });
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

type Recording = {
  recorder: MediaRecorder;
  startedAt: string;
  endedAt?: string;
};
