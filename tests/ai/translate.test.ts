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

import { translate } from "@/ai/translate";

describe("OpenAI translation", () => {
  beforeEach(() => {
    openAIMocks.create.mockReset();
    openAIMocks.constructor.mockReset();
  });

  it("requests a translation and trims the returned text", async () => {
    openAIMocks.create.mockResolvedValue({ output_text: "  こんにちは  " });

    await expect(translate("secret", "en", "ja", "Hello")).resolves.toBe("こんにちは");
    expect(openAIMocks.constructor).toHaveBeenCalledWith({ apiKey: "secret" });
    expect(openAIMocks.create).toHaveBeenCalledWith({
      model: "gpt-5.6-luna",
      instructions: "Translate en speech transcripts into natural ja. Return only the ja translation, with no notes or quotation marks.",
      input: "Hello",
      reasoning: { effort: "none" },
      store: false,
      temperature: 0,
    });
  });

  it("rejects an empty model response", async () => {
    openAIMocks.create.mockResolvedValue({ output_text: "   " });

    await expect(translate("secret", "en", "fr", "Hello")).rejects.toThrow("Could not read translation.");
  });
});
