import { GeminiRateLimitError } from "@/ai/gemini/generate";
import { afterEach, describe, expect, it, vi } from "vitest";

const gemini = vi.hoisted(() => vi.fn());
vi.mock("@/ai/gemini/translate-many", () => ({ translateMany: gemini }));
const translateMany = vi.hoisted(() => vi.fn());

vi.mock("@/ai/openai/translate-many", () => ({ translateMany }));

import { POST } from "@/app/api/translate/[provider]/many/route";

function post(request: Request) {
  const provider = new URL(request.url).pathname.split("/")[3];
  return POST(request, { params: Promise.resolve({ provider }) });
}

afterEach(() => {
  vi.unstubAllEnvs();
});

function request(body = "Hello. How are you?", langFrom = "en", langTo = "ja") {
  return new Request("https://example.test/api/translate/openai/many", {
    method: "POST",
    headers: {
      "X-Lang-From": langFrom,
      "X-Lang-To": langTo,
    },
    body,
  });
}

describe("POST /api/translate/openai/many", () => {
  it("returns aligned final transcript and translation", async () => {
    vi.stubEnv("OPENAI_API_KEY", "secret");
    const result = { transcripts: ["Hello.", "How are you?"], translations: ["こんにちは。", "お元気ですか？"] };
    translateMany.mockResolvedValue(result);

    const response = await post(request());

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual(result);
    expect(translateMany).toHaveBeenCalledWith("secret", "en", "ja", "Hello. How are you?");
  });

  it("rejects blank text", async () => {
    vi.stubEnv("OPENAI_API_KEY", "secret");

    const response = await post(request(" \n "));

    expect(response.status).toBe(400);
    expect(translateMany).not.toHaveBeenCalled();
  });

  it("returns final translation failures as a bad gateway", async () => {
    vi.stubEnv("OPENAI_API_KEY", "secret");
    translateMany.mockRejectedValue(new Error("unaligned transcript"));

    const response = await post(request());

    expect(response.status).toBe(502);
    await expect(response.json()).resolves.toEqual({ error: "unaligned transcript" });
  });
});

// Provider routing must not fall back to OpenAI when Gemini is selected.
it("uses Gemini without an OpenAI key", async () => {
  vi.stubEnv("OPENAI_API_KEY", "");
  vi.stubEnv("GEMINI_API_KEY", "secret");
  gemini.mockResolvedValue({ transcripts: ["Hello"], translations: ["こんにちは"] });
  const req = new Request("https://example.test/api/translate/gemini/many", { method: "POST", body: "Hello" });
  const response = await post(req);
  expect(response.status).toBe(200);
  expect(gemini).toHaveBeenCalledWith("secret", "en", "ja", "Hello");
  expect(translateMany).not.toHaveBeenCalled();
});

it("rejects an unknown provider", async () => {
  await expect(post(new Request("https://example.test/api/translate/other/many", { method: "POST", body: "Hello" }))).rejects.toMatchObject({ digest: "NEXT_HTTP_ERROR_FALLBACK;404" });

  expect(gemini).not.toHaveBeenCalled();
  expect(translateMany).not.toHaveBeenCalled();
});

it("reports a missing Gemini key without falling back", async () => {
  vi.stubEnv("OPENAI_API_KEY", "secret");
  vi.stubEnv("GEMINI_API_KEY", "");
  const response = await post(new Request("https://example.test/api/translate/gemini/many", { method: "POST", body: "Hello" }));
  expect(response.status).toBe(500);
  expect(await response.json()).toEqual({ error: "GEMINI_API_KEY is not set. Add it to .env.local." });
  expect(translateMany).not.toHaveBeenCalled();
});

it("preserves Gemini rate limits and the retry delay", async () => {
  vi.stubEnv("GEMINI_API_KEY", "secret");
  gemini.mockRejectedValue(new GeminiRateLimitError(30));
  const response = await post(new Request("https://example.test/api/translate/gemini/many", { method: "POST", body: "Hello" }));
  expect(response.status).toBe(429);
  expect(response.headers.get("Retry-After")).toBe("30");
  expect((await response.json()).error).toContain("Gemini rate limit");
});
