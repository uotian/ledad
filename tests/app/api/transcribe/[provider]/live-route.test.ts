import { afterEach, describe, expect, it, vi } from "vitest";
import { defaultSettings } from "@/lib/settings";
import type { Settings, TranscriptionProvider } from "@/lib/types";

const createOpenAILiveToken = vi.hoisted(() => vi.fn());
const createGeminiLiveToken = vi.hoisted(() => vi.fn());
vi.mock("@/ai/openai/transcribe-live", () => ({ createOpenAILiveToken }));
vi.mock("@/ai/gemini/transcribe-live", () => ({ createGeminiLiveToken }));

import { POST } from "@/app/api/transcribe/[provider]/live/route";

afterEach(() => vi.unstubAllEnvs());

function context(provider: string) {
  return { params: Promise.resolve({ provider }) };
}

function request(provider: string, settings: Settings = { ...defaultSettings, provider: provider === "gemini" ? "gemini" : "openai" }) {
  return new Request(`https://example.test/api/transcribe/${provider}/live`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ settings }),
  });
}

describe("POST /api/transcribe/[provider]/live", () => {
  it.each(["openai", "gemini"] as const)("returns the %s temporary token", async (provider: TranscriptionProvider) => {
    vi.stubEnv(provider === "openai" ? "OPENAI_API_KEY" : "GEMINI_API_KEY", "secret");
    const selected = provider === "openai" ? createOpenAILiveToken : createGeminiLiveToken;
    selected.mockResolvedValue("ephemeral-token");
    const settings = { ...defaultSettings, provider, langFrom: "fr" as const, keywords: ["大ピラミッド"] };

    const response = await POST(request(provider, settings), context(provider));

    expect(response.status).toBe(200);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    await expect(response.json()).resolves.toEqual({ token: "ephemeral-token" });
    expect(selected).toHaveBeenCalledWith("secret", settings);
    expect(provider === "openai" ? createGeminiLiveToken : createOpenAILiveToken).not.toHaveBeenCalled();
  });

  it.each(["openai", "gemini"] as const)("reports a missing %s API key", async (provider) => {
    vi.stubEnv(provider === "openai" ? "OPENAI_API_KEY" : "GEMINI_API_KEY", "");
    const response = await POST(request(provider), context(provider));
    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({ error: `${provider.toUpperCase()}_API_KEY is not set. Add it to .env.local.` });
  });

  it("rejects unknown providers", async () => {
    await expect(POST(request("other"), context("other"))).rejects.toMatchObject({ digest: "NEXT_HTTP_ERROR_FALLBACK;404" });

  });

  it("rejects missing and mismatched settings", async () => {
    vi.stubEnv("GEMINI_API_KEY", "secret");
    const missing = await POST(new Request("https://example.test/api/transcribe/gemini/live", { method: "POST", body: "{}" }), context("gemini"));
    const mismatch = await POST(request("gemini", defaultSettings), context("gemini"));
    expect(missing.status).toBe(400);
    expect(mismatch.status).toBe(400);
    expect(createGeminiLiveToken).not.toHaveBeenCalled();
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
