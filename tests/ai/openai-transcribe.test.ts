import { beforeEach, describe, expect, it, vi } from "vitest";

const openAIMocks = vi.hoisted(() => ({
  constructor: vi.fn(),
  create: vi.fn(),
}));

vi.mock("openai", () => ({
  default: class OpenAI {
    audio = { transcriptions: { create: openAIMocks.create } };

    constructor(options: unknown) {
      openAIMocks.constructor(options);
    }
  },
}));

import { transcribe } from "@/ai/openai/transcribe";

describe("OpenAI transcription", () => {
  beforeEach(() => {
    openAIMocks.create.mockReset();
    openAIMocks.constructor.mockReset();
  });

  it("transcribes an audio file with the selected settings", async () => {
    openAIMocks.create.mockResolvedValue({ text: "  Final transcript.  " });
    const audio = new File(["audio"], "transcript.webm", { type: "audio/webm" });

    await expect(transcribe("secret", audio, {
      provider: "openai",
      textSize: "M",
      langFrom: "en",
      langTo: "ja",
      langInsight: "ja",
      prompt: "A meeting.",
      keywords: [],
    })).resolves.toBe("Final transcript.");

    expect(openAIMocks.constructor).toHaveBeenCalledWith({ apiKey: "secret" });
    expect(openAIMocks.create).toHaveBeenCalledWith({
      file: audio,
      model: "gpt-transcribe",
      language: "en",
      prompt: "A meeting.",
    });
  });
});
