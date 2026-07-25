import { afterEach, describe, expect, it, vi } from "vitest";

const translate = vi.hoisted(() => vi.fn());

vi.mock("@/ai/translate", () => ({ translate }));

import { POST } from "@/app/api/translate/route";

afterEach(() => {
  vi.unstubAllEnvs();
});

function request(body = "Hello", langFrom = "en", langTo = "ja") {
  return new Request("https://example.test/api/translate", {
    method: "POST",
    headers: {
      "X-Lang-From": langFrom,
      "X-Lang-To": langTo,
    },
    body,
  });
}

describe("POST /api/translate", () => {
  it("rejects requests when the API key is missing", async () => {
    vi.stubEnv("OPENAI_API_KEY", "");

    const response = await POST(request());

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      error: "OPENAI_API_KEY is not set. Add it to .env.local.",
    });
    expect(translate).not.toHaveBeenCalled();
  });

  it("rejects blank text after trimming", async () => {
    vi.stubEnv("OPENAI_API_KEY", "secret");

    const response = await POST(request(" \n "));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: "No text to translate." });
  });

  it("translates trimmed text with validated languages", async () => {
    vi.stubEnv("OPENAI_API_KEY", "secret");
    translate.mockResolvedValue("こんにちは");

    const response = await POST(request("  Hello  ", "fr", "zh"));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ translation: "こんにちは" });
    expect(translate).toHaveBeenCalledWith("secret", "fr", "zh", "Hello");
  });

  it("uses defaults for invalid languages", async () => {
    vi.stubEnv("OPENAI_API_KEY", "secret");
    translate.mockResolvedValue("translation");

    await POST(request("Hello", "de", "ko"));

    expect(translate).toHaveBeenCalledWith("secret", "en", "ja", "Hello");
  });

  it("maps thrown values to a bad gateway response", async () => {
    vi.stubEnv("OPENAI_API_KEY", "secret");
    translate.mockRejectedValue("upstream failed");

    const response = await POST(request());

    expect(response.status).toBe(502);
    await expect(response.json()).resolves.toEqual({ error: "upstream failed" });
  });
});
