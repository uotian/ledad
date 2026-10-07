export const SENTENCE_ENDS = [".", "。", "?", "？", "!", "！"];
export const TRANSLATION_BREAKS = [...SENTENCE_ENDS, ",", "、"];

export function formatSentences(text: string) {
  return splitSentences(text).map((part) => part.text.trim()).filter(Boolean).join("\n");
}

// Keep separators and whitespace in the text so streamed input can be reconstructed.
export function splitSentences(input: string, separators: readonly string[] = SENTENCE_ENDS) {
  const parts: { text: string; separator: string | null }[] = [];
  let text = "";
  for (const char of input) {
    text += char;
    if (separators.includes(char)) {
      parts.push({ text, separator: char });
      text = "";
    }
  }
  if (text) parts.push({ text, separator: null });
  return parts;
}
