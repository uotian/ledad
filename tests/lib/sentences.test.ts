import { describe, expect, it } from "vitest";
import { formatSentences, splitSentences, TRANSLATION_BREAKS } from "@/lib/utils/sentences";

describe("sentence utilities", () => {
  it("preserves punctuation, whitespace, and an unfinished tail", () => {
    const input = "  Hello, world. 次の話、途中";
    const parts = splitSentences(input, TRANSLATION_BREAKS);
    expect(parts.map((part) => part.text).join("")).toBe(input);
    expect(parts.map((part) => part.separator)).toEqual([",", ".", "、", null]);
    expect(parts.at(-1)).toEqual({ text: "途中", separator: null });
  });

  it("accepts custom separator characters without treating them as a regular expression", () => {
    expect(splitSentences("one]two|tail", ["]", "|"])).toEqual([
      { text: "one]", separator: "]" },
      { text: "two|", separator: "|" },
      { text: "tail", separator: null },
    ]);
  });

  it("returns no parts for empty input", () => {
    expect(splitSentences("")).toEqual([]);
  });

  it("formats sentences while keeping commas within their sentence", () => {
    expect(formatSentences(" Hello, world. 次の話、続きです。\n 末尾 "))
      .toBe("Hello, world.\n次の話、続きです。\n末尾");
    expect(formatSentences("Hello.  ")).toBe("Hello.");
    expect(formatSentences("   ")).toBe("");
  });
});
