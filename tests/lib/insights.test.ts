import { afterEach, describe, expect, it, vi } from "vitest";
import { generateInsights, type InsightsRequest } from "@/lib/insights";

const input: InsightsRequest = { lang: "ja", items: [{ id: "one", type: "flush", startedAt: "2026-09-22T00:00:00Z", transcripts: ["Hello"], translations: [""] }] };
afterEach(() => vi.unstubAllGlobals());
describe("topic API client", () => {
  it("posts the full snapshot with the abort signal", async () => {
    const data = { allTopics: [], currentTopic: null };
    const fetchMock = vi.fn().mockResolvedValue(Response.json(data));
    vi.stubGlobal("fetch", fetchMock);
    const signal = new AbortController().signal;
    await expect(generateInsights(input, signal)).resolves.toEqual(data);
    expect(fetchMock).toHaveBeenCalledWith("/api/insights", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input), signal,
    });
  });
  it.each([
    { payload: { error: "Unavailable" }, status: 502 },
    { payload: { allTopics: [] }, status: 200 },
  ])("rejects invalid or failed responses", async ({ payload, status }) => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json(payload, { status })));
    await expect(generateInsights(input, new AbortController().signal)).rejects.toThrow();
  });
});
