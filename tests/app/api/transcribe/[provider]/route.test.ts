import { afterEach, describe, expect, it, vi } from "vitest";
import { defaultSettings } from "@/lib/settings";
import type { TranscriptionProvider } from "@/lib/types";

const transcribe = vi.hoisted(() => vi.fn());
vi.mock("@/ai/openai/transcribe", () => ({ transcribe }));

import { POST } from "@/app/api/transcribe/[provider]/route";

afterEach(() => vi.unstubAllEnvs());

function context(provider: string) {
  return { params: Promise.resolve({ provider }) };
}

function request(provider: string, settings: unknown = defaultSettings) {
  const formData = new FormData();
  formData.set("audio", new File(["audio"], "recording.webm", { type: "audio/webm" }));
  formData.set("settings", JSON.stringify(settings));
  return new Request(`https://example.test/api/transcribe/${provider}`, { method: "POST", body: formData });
}

describe("POST /api/transcribe/[provider]", () => {
  it.each(["openai"] as const)("uses the %s implementation", async (provider: TranscriptionProvider) => {
    vi.stubEnv("OPENAI_API_KEY", "secret");
    const selected = transcribe;
    selected.mockResolvedValue("Final transcript.");

    const response = await POST(request(provider), context(provider));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ transcript: "Final transcript." });
    expect(selected).toHaveBeenCalledWith("secret", expect.anything(), { ...defaultSettings, provider });
  });

  it("rejects unknown providers", async () => {
    const response = await POST(request("other"), context("other"));
    expect(response.status).toBe(404);
    expect(transcribe).not.toHaveBeenCalled();
  });

  it("rejects a mismatch between the URL and settings", async () => {
    vi.stubEnv("OPENAI_API_KEY", "secret");
    const response = await POST(request("openai", { ...defaultSettings, provider: "other" }), context("openai"));
    expect(response.status).toBe(400);
  });

  it("rejects missing audio and invalid settings", async () => {
    vi.stubEnv("OPENAI_API_KEY", "secret");
    const formData = new FormData();
    formData.set("settings", "invalid json");
    const response = await POST(new Request("https://example.test/api/transcribe/openai", { method: "POST", body: formData }), context("openai"));
    expect(response.status).toBe(400);
    expect(transcribe).not.toHaveBeenCalled();
  });
});
