import { afterEach, describe, expect, it, vi } from "vitest";

const transcribeFinal = vi.hoisted(() => vi.fn());
vi.mock("@/ai/final-transcript", () => ({ transcribeFinal }));

import { POST } from "@/app/api/final-transcript/route";

afterEach(() => vi.unstubAllEnvs());

function request({ audio = new File(["audio"], "chunk.webm", { type: "audio/webm" }), language = "en", prompt = "meeting" } = {}) {
  const formData = new FormData();
  formData.set("audio", audio);
  formData.set("language", language);
  formData.set("prompt", prompt);
  return new Request("https://example.test/api/final-transcript", { method: "POST", body: formData });
}

describe("POST /api/final-transcript", () => {
  it("keeps the API key on the server and returns the final transcript", async () => {
    vi.stubEnv("OPENAI_API_KEY", "secret");
    transcribeFinal.mockResolvedValue("Final transcript.");

    const response = await POST(request());

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ transcript: "Final transcript." });
    expect(transcribeFinal).toHaveBeenCalledWith("secret", expect.anything(), "en", "meeting");
  });

  it("rejects invalid audio and language before calling OpenAI", async () => {
    vi.stubEnv("OPENAI_API_KEY", "secret");

    const response = await POST(request({ audio: new File([], "empty.webm"), language: "ko" }));

    expect(response.status).toBe(400);
    expect(transcribeFinal).not.toHaveBeenCalled();
  });

  it("returns a useful error when the API key is missing", async () => {
    vi.stubEnv("OPENAI_API_KEY", "");

    const response = await POST(request());

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({ error: "OPENAI_API_KEY is not set. Add it to .env.local." });
  });
});
