// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GeminiRateLimitError } from "@/ai/gemini/generate";
import { translate } from "@/ai/gemini/translate";
import { translateMany } from "@/ai/gemini/translate-many";
import { generateInsights } from "@/ai/gemini/insights";
import type { InsightsRequest } from "@/lib/insights";

const backoff = vi.hoisted(() => vi.fn());
vi.mock("node:timers/promises", () => ({ setTimeout: backoff, default: { setTimeout: backoff } }));
beforeEach(() => backoff.mockReset().mockResolvedValue(undefined));

const input: InsightsRequest = { lang: "ja", items: [{ id: "one", type: "flush", startedAt: "2026-09-22T00:00:00Z", transcripts: ["Hello"], translations: [] }] };
function respond(text: string, status = "completed") {
  const fetchMock = vi.fn().mockResolvedValue(Response.json({ status, steps: [
    { type: "model_output", content: [{ type: "thought", text: "Do not display this." }, { type: "text", text }] },
  ] }));
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); vi.useRealTimers(); });

describe("Gemini text generation", () => {
  it("translates with the requested languages and reads only model text", async () => {
    vi.stubEnv("GOOGLE_GENAI_API_VERSION", "v1beta");
    vi.stubEnv("GOOGLE_GENAI_USE_VERTEXAI", "true");
    vi.stubEnv("GOOGLE_GEMINI_BASE_URL", "https://example.test");
    const fetchMock = respond("  こんにちは  ");
    await expect(translate("secret", "en", "ja", "Hello")).resolves.toBe("こんにちは");
    const request = new Request(...fetchMock.mock.calls[0] as [RequestInfo, RequestInit?]);
    expect(request.url).toBe("https://generativelanguage.googleapis.com/v1/interactions");
    expect(request.headers.get("x-goog-api-key")).toBe("secret");
    expect(request.headers.get("x-goog-api-client")).toContain("google-genai-sdk/3.");
    expect(await request.json()).toMatchObject({ model: "gemini-3.8-flash", input: "Hello", store: false, system_instruction: expect.stringContaining("en speech transcripts into natural ja"), generation_config: { thinking_level: "low", max_output_tokens: 8000 } });
  });

  it("returns trimmed, aligned transcript and translation segments", async () => {
    const fetchMock = respond(JSON.stringify({ segments: [{ transcript: " Hello. ", translation: " こんにちは。 " }, { transcript: "Bye.", translation: "さようなら。" }] }));
    await expect(translateMany("secret", "en", "ja", "Hello. Bye.")).resolves.toEqual({ transcripts: ["Hello.", "Bye."], translations: ["こんにちは。", "さようなら。"] });
    const request = new Request(...fetchMock.mock.calls[0] as [RequestInfo, RequestInit?]);
    expect(request.url).toBe("https://generativelanguage.googleapis.com/v1/interactions");
    expect((await request.json()).response_format).toMatchObject({ type: "text", mime_type: "application/json", schema: { required: ["segments"] } });
  });

  it.each(["not json", "null", "{}", '{"segments":[]}', '{"segments":[null]}', '{"segments":[{"transcript":"Hello","translation":" "}]}', '{"segments":[{"transcript":12,"translation":"a"}]}'])("rejects malformed translations: %s", async (text) => {
    respond(text);
    await expect(translateMany("secret", "en", "ja", "Hello")).rejects.toThrow();
  });

  it("returns topics with the same contract and forwards cancellation", async () => {
    const data = { allTopics: [{ title: "予算", summary: "予算を確認しました。" }], currentTopic: null };
    const fetchMock = respond(JSON.stringify(data));
    const controller = new AbortController();
    await expect(generateInsights("secret", input, controller.signal)).resolves.toEqual(data);
    const request = new Request(...fetchMock.mock.calls[0] as [RequestInfo, RequestInit?]);
    expect(request.url).toBe("https://generativelanguage.googleapis.com/v1/interactions");
    expect(await request.json()).toMatchObject({ input: JSON.stringify(input.items), system_instruction: expect.stringContaining("untrusted meeting data"), response_format: { schema: { required: ["allTopics", "currentTopic"] } } });
    controller.abort();
    expect(request.signal.aborted).toBe(true);
  });

  it("rejects invalid topics", async () => {
    respond('{"allTopics":[],"currentTopic":{"title":"x"}}');
    await expect(generateInsights("secret", input)).rejects.toThrow("Could not read insights.");
  });

  it.each(["incomplete", "failed", "cancelled", "requires_continuation"])("rejects %s responses even with readable output", async (status) => {
    const fetchMock = respond("partial translation", status);
    await expect(translate("secret", "en", "ja", "Hello")).rejects.toThrow("incomplete");
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it("rejects empty output", async () => {
    respond(" ");
    await expect(translate("secret", "en", "ja", "Hello")).rejects.toThrow("did not return text");
  });

  it("reports upstream failures without including provider response details", async () => {
    vi.stubGlobal("fetch", vi.fn().mockImplementation(() => Promise.resolve(Response.json({ error: "private details" }, { status: 503 }))));
    await expect(translate("secret", "en", "ja", "Hello")).rejects.toThrow("Gemini request failed (503).");
  });
});

it.each([429, 503])("waits for Retry-After before retrying a transient %s", async (status) => {
  const success = { status: "completed", steps: [{ type: "model_output", content: [{ type: "text", text: "こんにちは" }] }] };
  const fetchMock = vi.fn().mockResolvedValueOnce(Response.json({ error: {} }, { status, headers: { "Retry-After": "3" } })).mockResolvedValueOnce(Response.json(success));
  vi.stubGlobal("fetch", fetchMock);
  await expect(translate("secret", "en", "ja", "Hello")).resolves.toBe("こんにちは");
  expect(backoff).toHaveBeenCalledExactlyOnceWith(3000, undefined, { signal: expect.any(AbortSignal) });
  expect(fetchMock).toHaveBeenCalledTimes(2);
});

it("stops after two retries instead of retrying forever", async () => {
  const fetchMock = vi.fn().mockImplementation(() => Promise.resolve(Response.json({ error: {} }, { status: 429 })));
  vi.stubGlobal("fetch", fetchMock);
  await expect(translate("secret", "en", "ja", "Hello")).rejects.toBeInstanceOf(GeminiRateLimitError);
  expect(fetchMock).toHaveBeenCalledTimes(3);
  expect(backoff.mock.calls.map(([delay]) => delay)).toEqual([2000, 4000]);
});

it("reads the retry delay from Gemini error details", async () => {
  const fetchMock = vi.fn().mockImplementation(() => Promise.resolve(Response.json({ error: { details: [{ retryDelay: "4.2s" }] } }, { status: 429 })));
  vi.stubGlobal("fetch", fetchMock);
  await expect(translate("secret", "en", "ja", "Hello")).rejects.toMatchObject({ retryAfter: 5 });
  expect(backoff.mock.calls.map(([delay]) => delay)).toEqual([5000, 5000]);
});

it("does not retry an exhausted daily quota", async () => {
  const fetchMock = vi.fn().mockResolvedValue(Response.json({ error: { details: [{ violations: [{ quotaId: "GenerateRequestsPerDayPerProjectPerModel-FreeTier" }] }] } }, { status: 429 }));
  vi.stubGlobal("fetch", fetchMock);
  await expect(translate("secret", "en", "ja", "Hello")).rejects.toBeInstanceOf(GeminiRateLimitError);
  expect(fetchMock).toHaveBeenCalledOnce();
  expect(backoff).not.toHaveBeenCalled();
});

it("returns the rate limit immediately if the requested wait exceeds the deadline", async () => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json({ error: {} }, { status: 429, headers: { "Retry-After": "120" } })));
  await expect(translate("secret", "en", "ja", "Hello")).rejects.toMatchObject({ retryAfter: 120 });
  expect(backoff).not.toHaveBeenCalled();
});

it("cancels a pending backoff when Insights is stopped", async () => {
  const controller = new AbortController();
  const fetchMock = vi.fn().mockResolvedValue(Response.json({ error: {} }, { status: 429 }));
  vi.stubGlobal("fetch", fetchMock);
  backoff.mockImplementationOnce((_delay, _value, { signal }: { signal: AbortSignal }) => new Promise((_resolve, reject) => {
    signal.addEventListener("abort", () => reject(signal.reason), { once: true });
    controller.abort();
  }));
  await expect(generateInsights("secret", input, controller.signal)).rejects.toMatchObject({ name: "AbortError" });
  expect(fetchMock).toHaveBeenCalledOnce();
});

it("does not retry the Interactions Free Tier daily limit even with Retry-After", async () => {
  const fetchMock = vi.fn().mockResolvedValue(Response.json({ error: {
    message: "Rate limit exceeded for model gemini-3.8-flash (limit: 20 requests per day on Free Tier). Please retry in 46s or upgrade your tier at https://ai.dev/rate-limit.",
    code: "too_many_requests",
  } }, { status: 429, headers: { "Retry-After": "46" } }));
  vi.stubGlobal("fetch", fetchMock);
  await expect(translate("secret", "en", "ja", "Hello")).rejects.toMatchObject({
    message: expect.stringContaining("daily request limit reached"), retryAfter: undefined,
  });
  expect(fetchMock).toHaveBeenCalledOnce();
  expect(backoff).not.toHaveBeenCalled();
});
