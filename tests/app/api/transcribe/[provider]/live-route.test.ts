import { afterEach, describe, expect, it, vi } from "vitest";
import { defaultSettings } from "@/lib/settings";
import type { TranscriptionProvider } from "@/lib/types";

const createOpenAILiveToken = vi.hoisted(() => vi.fn());
vi.mock("@/ai/openai/transcribe-live", () => ({ createOpenAILiveToken }));

import { POST } from "@/app/api/transcribe/[provider]/live/route";

afterEach(() => vi.unstubAllEnvs());

function context(provider: string) {
  return { params: Promise.resolve({ provider }) };
}

function request(provider: string, settings: unknown = defaultSettings) {
  return new Request(`https://example.test/api/transcribe/${provider}/live`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ settings }),
  });
}

describe("POST /api/transcribe/[provider]/live", () => {
  it.each(["openai"] as const)("returns the %s temporary token", async (provider: TranscriptionProvider) => {
    vi.stubEnv("OPENAI_API_KEY", "secret");
    const selected = createOpenAILiveToken;
    selected.mockResolvedValue("ephemeral-token");
    const settings = { ...defaultSettings, provider, langFrom: "fr" as const, keywords: ["大ピラミッド"] };

    const response = await POST(request(provider, settings), context(provider));

    expect(response.status).toBe(200);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    await expect(response.json()).resolves.toEqual({ token: "ephemeral-token" });
    expect(selected).toHaveBeenCalledWith("secret", settings);
  });

  it.each(["openai"] as const)("reports a missing %s API key", async (provider) => {
    vi.stubEnv("OPENAI_API_KEY", "");
    const response = await POST(request(provider), context(provider));
    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({ error: `${provider.toUpperCase()}_API_KEY is not set. Add it to .env.local.` });
  });

  it("rejects unknown providers", async () => {
    const response = await POST(request("other"), context("other"));
    expect(response.status).toBe(404);
  });

  it("rejects missing and mismatched settings", async () => {
    vi.stubEnv("OPENAI_API_KEY", "secret");
    const missing = await POST(new Request("https://example.test/api/transcribe/openai/live", { method: "POST", body: "{}" }), context("openai"));
    const mismatch = await POST(request("openai", { ...defaultSettings, provider: "other" }), context("openai"));
    expect(missing.status).toBe(400);
    expect(mismatch.status).toBe(400);
  });

  it("rejects invalid keywords before calling OpenAI", async () => {
    vi.stubEnv("OPENAI_API_KEY", "secret");
    const response = await POST(request("openai", { ...defaultSettings, keywords: ["<invalid>"] }), context("openai"));
    expect(response.status).toBe(400);
    expect(createOpenAILiveToken).not.toHaveBeenCalled();
  });

  it("maps upstream errors to a bad gateway response", async () => {
    vi.stubEnv("OPENAI_API_KEY", "secret");
    createOpenAILiveToken.mockRejectedValue(new Error("OpenAI unavailable"));
    const response = await POST(request("openai"), context("openai"));
    expect(response.status).toBe(502);
    await expect(response.json()).resolves.toEqual({ error: "OpenAI unavailable" });
  });
});
