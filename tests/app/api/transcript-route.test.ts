import { afterEach, describe, expect, it, vi } from "vitest";

const exchangeSDP = vi.hoisted(() => vi.fn());

vi.mock("@/ai/realtime/transcript", () => ({ exchangeSDP }));

import { POST } from "@/app/api/transcript/route";
import { defaultSettings } from "@/lib/settings";

afterEach(() => {
  vi.unstubAllEnvs();
});

function request(body = "offer-sdp", lang = "en", settings = defaultSettings) {
  return new Request("https://example.test/api/transcript", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Lang-From": lang },
    body: JSON.stringify({ sdp: body, settings }),
  });
}

describe("POST /api/transcript", () => {
  it("rejects requests when the API key is missing", async () => {
    vi.stubEnv("OPENAI_API_KEY", "");

    const response = await POST(request());

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      error: "OPENAI_API_KEY is not set. Add it to .env.local.",
    });
    expect(exchangeSDP).not.toHaveBeenCalled();
  });

  it("rejects blank SDP", async () => {
    vi.stubEnv("OPENAI_API_KEY", "secret");

    const response = await POST(request("  \n "));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: "No SDP for Realtime connection." });
  });

  it("returns the upstream answer and validates the language", async () => {
    vi.stubEnv("OPENAI_API_KEY", "secret");
    exchangeSDP.mockResolvedValue("answer-sdp");

    const settings = { prompt: "古代エジプトについて。", keywords: ["大ピラミッド"] };
    const response = await POST(request("offer-sdp", "fr", settings));

    expect(response.status).toBe(200);
    await expect(response.text()).resolves.toBe("answer-sdp");
    expect(exchangeSDP).toHaveBeenCalledWith("secret", "offer-sdp", "fr", settings);
  });

  it("falls back to English for an invalid language", async () => {
    vi.stubEnv("OPENAI_API_KEY", "secret");
    exchangeSDP.mockResolvedValue("answer");

    await POST(request("offer", "de"));

    expect(exchangeSDP).toHaveBeenCalledWith("secret", "offer", "en", defaultSettings);
  });

  it("rejects invalid keywords before calling OpenAI", async () => {
    vi.stubEnv("OPENAI_API_KEY", "secret");
    const response = await POST(request("offer", "ja", { prompt: "", keywords: ["<invalid>"] }));

    expect(response.status).toBe(400);
    expect(exchangeSDP).not.toHaveBeenCalled();
  });

  it("maps upstream errors to a bad gateway response", async () => {
    vi.stubEnv("OPENAI_API_KEY", "secret");
    exchangeSDP.mockRejectedValue(new Error("OpenAI unavailable"));

    const response = await POST(request());

    expect(response.status).toBe(502);
    await expect(response.json()).resolves.toEqual({ error: "OpenAI unavailable" });
  });
});
