import { GeminiRateLimitError } from "@/ai/gemini/generate";
import { afterEach, describe, expect, it, vi } from "vitest";
const gemini = vi.hoisted(() => vi.fn());
vi.mock("@/ai/gemini/insights", () => ({ generateInsights: gemini }));
const generateInsights = vi.hoisted(() => vi.fn());
vi.mock("@/ai/openai/insights", () => ({ generateInsights }));
import { POST } from "@/app/api/insights/[provider]/route";

function post(request: Request) {
  const provider = new URL(request.url).pathname.split("/")[3];
  return POST(request, { params: Promise.resolve({ provider }) });
}

const input = { lang: "ja", items: [{ id: "one", type: "flush", startedAt: "2026-09-22T00:00:00Z", transcripts: ["Hello"], translations: [""] }] };
const request = (body: string) => new Request("https://example.test/api/insights/openai", { method: "POST", body });
afterEach(() => vi.unstubAllEnvs());
describe("POST /api/insights/openai", () => {
  it("validates input and forwards cancellation to the provider", async () => {
    vi.stubEnv("OPENAI_API_KEY", "secret");
    const result = { allTopics: [], currentTopic: null };
    generateInsights.mockResolvedValue(result);
    const req = request(JSON.stringify(input));
    const response = await post(req);
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual(result);
    expect(generateInsights).toHaveBeenCalledWith("secret", input, req.signal);
  });
  it.each(["broken", "null", "{}", JSON.stringify({ ...input, lang: "bad" }), JSON.stringify({ ...input, items: [] }), JSON.stringify({ ...input, items: [{ ...input.items[0], transcripts: [" "] }] })])("rejects malformed input", async (body) => {
    vi.stubEnv("OPENAI_API_KEY", "secret");
    expect((await post(request(body))).status).toBe(400);
    expect(generateInsights).not.toHaveBeenCalled();
  });
  it("rejects oversized requests before invoking the model", async () => {
    vi.stubEnv("OPENAI_API_KEY", "secret");
    expect((await post(request("x".repeat(512_001)))).status).toBe(413);
    expect(generateInsights).not.toHaveBeenCalled();
  });
  it("reports a missing server key", async () => {
    vi.stubEnv("OPENAI_API_KEY", "");
    expect((await post(request(JSON.stringify(input)))).status).toBe(500);
    expect(generateInsights).not.toHaveBeenCalled();
  });
  it("returns a retryable error without exposing provider details", async () => {
    vi.stubEnv("OPENAI_API_KEY", "secret");
    generateInsights.mockRejectedValue(new Error("internal details"));
    const response = await post(request(JSON.stringify(input)));
    expect(response.status).toBe(502);
    expect(await response.text()).not.toContain("internal details");
  });
});

// Provider routing must not fall back to OpenAI when Gemini is selected.
it("uses Gemini without an OpenAI key", async () => {
  vi.stubEnv("OPENAI_API_KEY", "");
  vi.stubEnv("GEMINI_API_KEY", "secret");
  gemini.mockResolvedValue({ allTopics: [], currentTopic: null });
  const req = new Request("https://example.test/api/insights/gemini", { method: "POST", body: JSON.stringify(input) });
  const response = await post(req);
  expect(response.status).toBe(200);
  expect(gemini).toHaveBeenCalledWith("secret", input, req.signal);
  expect(generateInsights).not.toHaveBeenCalled();
});

it("rejects an unknown provider", async () => {
  await expect(post(new Request("https://example.test/api/insights/other", { method: "POST", body: JSON.stringify(input) }))).rejects.toMatchObject({ digest: "NEXT_HTTP_ERROR_FALLBACK;404" });

  expect(gemini).not.toHaveBeenCalled();
  expect(generateInsights).not.toHaveBeenCalled();
});

it("reports a missing Gemini key without falling back", async () => {
  vi.stubEnv("OPENAI_API_KEY", "secret");
  vi.stubEnv("GEMINI_API_KEY", "");
  const response = await post(new Request("https://example.test/api/insights/gemini", { method: "POST", body: JSON.stringify(input) }));
  expect(response.status).toBe(500);
  expect(await response.json()).toEqual({ error: "GEMINI_API_KEY is not set. Add it to .env.local." });
  expect(generateInsights).not.toHaveBeenCalled();
});

it("preserves Gemini rate limits and the retry delay", async () => {
  vi.stubEnv("GEMINI_API_KEY", "secret");
  gemini.mockRejectedValue(new GeminiRateLimitError(30));
  const response = await post(new Request("https://example.test/api/insights/gemini", { method: "POST", body: JSON.stringify(input) }));
  expect(response.status).toBe(429);
  expect(response.headers.get("Retry-After")).toBe("30");
  expect((await response.json()).error).toContain("Gemini rate limit");
});
