import { afterEach, describe, expect, it, vi } from "vitest";
const generateInsights = vi.hoisted(() => vi.fn());
vi.mock("@/ai/insights", () => ({ generateInsights }));
import { POST } from "@/app/api/insights/route";

const input = { lang: "ja", items: [{ id: "one", type: "flush", startedAt: "2026-09-22T00:00:00Z", transcripts: ["Hello"], translations: [""] }] };
const request = (body: string) => new Request("https://example.test/api/insights", { method: "POST", body });
afterEach(() => vi.unstubAllEnvs());
describe("POST /api/insights", () => {
  it("validates input and forwards cancellation to the provider", async () => {
    vi.stubEnv("OPENAI_API_KEY", "secret");
    const result = { allTopics: [], currentTopic: null };
    generateInsights.mockResolvedValue(result);
    const req = request(JSON.stringify(input));
    const response = await POST(req);
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual(result);
    expect(generateInsights).toHaveBeenCalledWith("secret", input, req.signal);
  });
  it.each(["broken", "null", "{}", JSON.stringify({ ...input, lang: "bad" }), JSON.stringify({ ...input, items: [] }), JSON.stringify({ ...input, items: [{ ...input.items[0], transcripts: [" "] }] })])("rejects malformed input", async (body) => {
    vi.stubEnv("OPENAI_API_KEY", "secret");
    expect((await POST(request(body))).status).toBe(400);
    expect(generateInsights).not.toHaveBeenCalled();
  });
  it("rejects oversized requests before invoking the model", async () => {
    vi.stubEnv("OPENAI_API_KEY", "secret");
    expect((await POST(request("x".repeat(512_001)))).status).toBe(413);
    expect(generateInsights).not.toHaveBeenCalled();
  });
  it("reports a missing server key", async () => {
    vi.stubEnv("OPENAI_API_KEY", "");
    expect((await POST(request(JSON.stringify(input)))).status).toBe(500);
    expect(generateInsights).not.toHaveBeenCalled();
  });
  it("returns a retryable error without exposing provider details", async () => {
    vi.stubEnv("OPENAI_API_KEY", "secret");
    generateInsights.mockRejectedValue(new Error("internal details"));
    const response = await POST(request(JSON.stringify(input)));
    expect(response.status).toBe(502);
    expect(await response.text()).not.toContain("internal details");
  });
});
