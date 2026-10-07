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

import { translate } from "@/ai/openai/translate";

describe("OpenAI translation", () => {
  beforeEach(() => {
    openAIMocks.create.mockReset();
    openAIMocks.constructor.mockReset();
  });

  it("requests a translation and trims the returned text", async () => {
    openAIMocks.create.mockResolvedValue({ status: "completed", output_text: JSON.stringify({ translation: "  こんにちは  " }) });

    await expect(translate("secret", "en", "ja", "Hello")).resolves.toBe("こんにちは");
    expect(openAIMocks.constructor).toHaveBeenCalledWith({ apiKey: "secret" });
    expect(openAIMocks.create).toHaveBeenCalledWith({
      model: "gpt-6-luna",
      instructions: expect.stringContaining("enの文字起こしtext全体をjaに忠実に翻訳"),
      input: JSON.stringify({ text: "Hello" }),
      text: { format: expect.objectContaining({ type: "json_schema", strict: true }) },
      reasoning: { effort: "none" },
      store: false,
    });
  });

  it("rejects an empty model response", async () => {
    openAIMocks.create.mockResolvedValue({ status: "completed", output_text: "   " });

    await expect(translate("secret", "en", "fr", "Hello")).rejects.toThrow("Could not read translation.");
  });

  it("sends the previous translation as reference data", async () => {
    openAIMocks.create.mockResolvedValue({ status: "completed", output_text: JSON.stringify({ translation: "こんにちは、皆さん。" }) });
    const previous = "こんにちは";
    await translate("secret", "en", "ja", "Hello everyone", previous);
    expect(openAIMocks.create).toHaveBeenCalledWith(expect.objectContaining({
      input: JSON.stringify({ text: "Hello everyone", previous }),
    }));
  });

  it.each([
    "The translation should be of the current text. I'll choose this wording.",
    "null",
    JSON.stringify({ translation: "  " }),
    JSON.stringify({ translation: 42 }),
    JSON.stringify({ explanation: "This is a request." }),
  ])("rejects invalid output instead of treating it as a translation: %s", async (output_text) => {
    openAIMocks.create.mockResolvedValue({ status: "completed", output_text });
    await expect(translate("secret", "ja", "en", "説明します")).rejects.toThrow("Could not read translation.");
  });

  it.each(["incomplete", "failed"])("rejects a %s response even if it contains valid JSON", async (status) => {
    openAIMocks.create.mockResolvedValue({ status, output_text: JSON.stringify({ translation: "Partial text" }) });
    await expect(translate("secret", "ja", "en", "説明します")).rejects.toThrow("Could not read translation.");
  });
});
