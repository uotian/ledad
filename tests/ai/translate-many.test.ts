import { beforeEach, describe, expect, it, vi } from "vitest";

const openAIMocks = vi.hoisted(() => ({
  constructor: vi.fn(),
  create: vi.fn(),
}));

vi.mock("openai", () => ({
  default: class OpenAI {
    responses = { create: openAIMocks.create };

    constructor(options: unknown) {
      openAIMocks.constructor(options);
    }
  },
}));

import { translateMany } from "@/ai/translate-many";

describe("OpenAI multiple translation", () => {
  beforeEach(() => {
    openAIMocks.create.mockReset();
    openAIMocks.constructor.mockReset();
  });

  it("returns aligned transcript and translation segments for a final item", async () => {
    openAIMocks.create.mockResolvedValue({ output_text: JSON.stringify({
      segments: [
        { transcript: "Hello.", translation: "こんにちは。" },
        { transcript: "How are you?", translation: "お元気ですか？" },
      ],
    }) });

    await expect(translateMany("secret", "en", "ja", "Hello. How are you?")).resolves.toEqual({
      transcripts: ["Hello.", "How are you?"],
      translations: ["こんにちは。", "お元気ですか？"],
    });
    expect(openAIMocks.create).toHaveBeenCalledWith(expect.objectContaining({
      model: "gpt-6-luna",
      input: "Hello. How are you?",
      text: { format: expect.objectContaining({ type: "json_schema", name: "translations", strict: true }) },
    }));
  });

  it("accepts an obvious transcription correction", async () => {
    openAIMocks.create.mockResolvedValue({ output_text: JSON.stringify({
      segments: [{ transcript: "The weather is nice.", translation: "天気がいいですね。" }],
    }) });

    await expect(translateMany("secret", "en", "ja", "The whether is nice.")).resolves.toEqual({
      transcripts: ["The weather is nice."],
      translations: ["天気がいいですね。"],
    });
  });
});
