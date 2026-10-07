import { GeminiRateLimitError } from "@/ai/gemini/generate";
import { APIError } from "openai";
import { afterEach, describe, expect, it, vi } from "vitest";

const gemini = vi.hoisted(() => vi.fn());
vi.mock("@/ai/gemini/translate", () => ({ translate: gemini }));
const translate = vi.hoisted(() => vi.fn());

vi.mock("@/ai/openai/translate", () => ({ translate }));

import { POST } from "@/app/api/translate/[provider]/route";

function post(request: Request) {
  const provider = new URL(request.url).pathname.split("/")[3];
  return POST(request, { params: Promise.resolve({ provider }) });
}

afterEach(() => {
  vi.unstubAllEnvs();
});

function request(body = "Hello", langFrom = "en", langTo = "ja") {
  return new Request("https://example.test/api/translate/openai", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Lang-From": langFrom,
      "X-Lang-To": langTo,
    },
    body: JSON.stringify({ text: body }),
  });
}

describe("POST /api/translate/openai", () => {
  it("preserves OpenAI's request rejection status", async () => {
    vi.stubEnv("OPENAI_API_KEY", "secret");
    translate.mockRejectedValueOnce(new APIError(400, { message: "Invalid prompt" }, "Invalid prompt", new Headers()));
    const response = await post(request());
    expect(response.status).toBe(400);
    expect((await response.json()).error).toContain("Invalid prompt");
  });
  it("passes the previous translation from JSON input", async () => {
    vi.stubEnv("OPENAI_API_KEY", "secret");
    translate.mockResolvedValue("こんにちは、皆さん。");
    const previous = "こんにちは";
    const response = await post(new Request("https://example.test/api/translate/openai", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: "Hello everyone", previous }),
    }));
    expect(response.status).toBe(200);
    expect(translate).toHaveBeenCalledWith("secret", "en", "ja", "Hello everyone", previous);
  });

  it.each(["{", "null", '{"text":5}', '{"text":"Hello","previous":[5]}', '{"text":"Hello","previous":null}'])("rejects malformed JSON input: %s", async (body) => {
    vi.stubEnv("OPENAI_API_KEY", "secret");
    const response = await post(new Request("https://example.test/api/translate/openai", {
      method: "POST", headers: { "Content-Type": "application/json" }, body,
    }));
    expect(response.status).toBe(400);
    expect(translate).not.toHaveBeenCalled();
  });

  it("rejects requests when the API key is missing", async () => {
    vi.stubEnv("OPENAI_API_KEY", "");

    const response = await post(request());

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      error: "OPENAI_API_KEY is not set. Add it to .env.local.",
    });
    expect(translate).not.toHaveBeenCalled();
  });

  it("rejects blank text after trimming", async () => {
    vi.stubEnv("OPENAI_API_KEY", "secret");

    const response = await post(request(" \n "));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: "Invalid translation input." });
  });

  it("translates trimmed text with validated languages", async () => {
    vi.stubEnv("OPENAI_API_KEY", "secret");
    translate.mockResolvedValue("こんにちは");

    const response = await post(request("  Hello  ", "fr", "zh"));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ translation: "こんにちは" });
    expect(translate).toHaveBeenCalledWith("secret", "fr", "zh", "Hello", "");
  });

  it("uses defaults for invalid languages", async () => {
    vi.stubEnv("OPENAI_API_KEY", "secret");
    translate.mockResolvedValue("translation");

    await post(request("Hello", "de", "ko"));

    expect(translate).toHaveBeenCalledWith("secret", "en", "ja", "Hello", "");
  });

  it("maps thrown values to a bad gateway response", async () => {
    vi.stubEnv("OPENAI_API_KEY", "secret");
    translate.mockRejectedValue("upstream failed");

    const response = await post(request());

    expect(response.status).toBe(502);
    await expect(response.json()).resolves.toEqual({ error: "upstream failed" });
  });
});

// Provider routing must not fall back to OpenAI when Gemini is selected.
it("uses Gemini without an OpenAI key", async () => {
  vi.stubEnv("OPENAI_API_KEY", "");
  vi.stubEnv("GEMINI_API_KEY", "secret");
  gemini.mockResolvedValue("こんにちは");
  const req = new Request("https://example.test/api/translate/gemini", { method: "POST", body: JSON.stringify({ text: "Hello" }) });
  const response = await post(req);
  expect(response.status).toBe(200);
  expect(gemini).toHaveBeenCalledWith("secret", "en", "ja", "Hello", "");
  expect(translate).not.toHaveBeenCalled();
});

it("rejects an unknown provider", async () => {
  await expect(post(new Request("https://example.test/api/translate/other", { method: "POST", body: "Hello" }))).rejects.toMatchObject({ digest: "NEXT_HTTP_ERROR_FALLBACK;404" });

  expect(gemini).not.toHaveBeenCalled();
  expect(translate).not.toHaveBeenCalled();
});

it("reports a missing Gemini key without falling back", async () => {
  vi.stubEnv("OPENAI_API_KEY", "secret");
  vi.stubEnv("GEMINI_API_KEY", "");
  const response = await post(new Request("https://example.test/api/translate/gemini", { method: "POST", body: JSON.stringify({ text: "Hello" }) }));
  expect(response.status).toBe(500);
  expect(await response.json()).toEqual({ error: "GEMINI_API_KEY is not set. Add it to .env.local." });
  expect(translate).not.toHaveBeenCalled();
});

it("preserves Gemini rate limits and the retry delay", async () => {
  vi.stubEnv("GEMINI_API_KEY", "secret");
  gemini.mockRejectedValue(new GeminiRateLimitError(30));
  const response = await post(new Request("https://example.test/api/translate/gemini", { method: "POST", body: JSON.stringify({ text: "Hello" }) }));
  expect(response.status).toBe(429);
  expect(response.headers.get("Retry-After")).toBe("30");
  expect((await response.json()).error).toContain("Gemini rate limit");
});
