import { Transcript as CommonTranscript } from "../common/transcript";

const SENTENCE_ENDS = [".", "。", "?", "？", "!", "！"];
const TRANSLATION_BREAKS = [...SENTENCE_ENDS, ",", "、"];

export class Transcript extends CommonTranscript {
  append(delta: string) {
    let text = "";
    for (const char of delta) {
      text += char;
      if (TRANSLATION_BREAKS.includes(char)) {
        this.replace((this.last.current?.transcripts[0] ?? "") + text);
        if (SENTENCE_ENDS.includes(char)) this.endSentence();
        else void this.translate();
        text = "";
      }
    }
    if (text) {
      this.replace((this.last.current?.transcripts[0] ?? "") + text);
      if (delta === " ") void this.translate();
    }
  }
}
