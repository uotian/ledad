import { SENTENCE_ENDS, TRANSLATION_BREAKS, splitSentences } from "@/lib/utils/sentences";
import { Transcript as CommonTranscript } from "../common/transcript";

export class Transcript extends CommonTranscript {
  append(delta: string) {
    for (const { text, separator } of splitSentences(delta, TRANSLATION_BREAKS)) {
      this.replace((this.last.current?.transcripts[0] ?? "") + text);
      if (separator && SENTENCE_ENDS.includes(separator)) this.endSentence();
      else if (separator || delta === " ") void this.translate();
    }
  }
}
