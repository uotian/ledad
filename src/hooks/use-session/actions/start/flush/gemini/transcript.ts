import { Transcript as CommonTranscript } from "../common/transcript";

const TRANSLATION_INTERVAL_MS = 0;

export class Transcript extends CommonTranscript {
  private timer: ReturnType<typeof setTimeout> | null = null;

  replace(text: string) {
    const changed = text !== this.last.current?.transcripts[0];
    super.replace(text);
    if (changed && !this.timer) {
      // Keep the deadline fixed while interim text continues to arrive.
      this.timer = setTimeout(() => {
        this.timer = null;
        // Translate the entire current utterance, not just the latest update.
        void this.translate();
      }, TRANSLATION_INTERVAL_MS);
    }
  }

  endSentence() {
    this.stop();
    super.endSentence();
  }

  stop() {
    if (this.timer) clearTimeout(this.timer);
    this.timer = null;
  }
}
