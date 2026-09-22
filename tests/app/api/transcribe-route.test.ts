import { afterEach, describe, expect, it, vi } from "vitest";

const transcribe = vi.hoisted(() => vi.fn());
vi.mock("@/ai/transcribe", () => ({ transcribe }));

import { POST } from "@/app/api/transcribe/route";
import { defaultSettings } from "@/lib/settings";

afterEach(() => vi.unstubAllEnvs());

function request({ audio = new File(["audio"], "recording.webm", { type: "audio/webm" }), settings = defaultSettings } = {}) {
  const formData = new FormData();
  formData.set("audio", audio);
  formData.set("settings", JSON.stringify(settings));
  return new Request("https://example.test/api/transcribe", { method: "POST", body: formData });
}

describe("POST /api/transcribe", () => {
  it("sends the uploaded audio to gpt-transcribe only on the server", async () => {
    vi.stubEnv("OPENAI_API_KEY", "secret");
    transcribe.mockResolvedValue("Final transcript.");

    const response = await POST(request());

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ transcript: "Final transcript." });
    expect(transcribe).toHaveBeenCalledWith("secret", expect.anything(), defaultSettings);
  });

  it("rejects missing audio and invalid settings", async () => {
    vi.stubEnv("OPENAI_API_KEY", "secret");
    const formData = new FormData();
    formData.set("settings", "invalid json");

    const response = await POST(new Request("https://example.test/api/transcribe", { method: "POST", body: formData }));

    expect(response.status).toBe(400);
    expect(transcribe).not.toHaveBeenCalled();
  });
});
