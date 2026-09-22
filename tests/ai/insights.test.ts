import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ create: vi.fn() }));
vi.mock("openai", () => ({ default: class { responses = { create: mocks.create }; } }));
import { generateInsights } from "@/ai/insights";
import type { InsightsRequest } from "@/lib/insights";

const input: InsightsRequest = { lang: "ja", items: [{ id: "1", type: "flush", startedAt: "2026-09-22T00:00:00Z", transcripts: ["Let's return to the budget."], translations: [""] }] };
beforeEach(() => mocks.create.mockReset());
describe("topic summaries", () => {
  it("uses Luna structured output and independently returns an earlier current topic", async () => {
    const budget = { title: "予算", summary: "予算を再検討しています。" };
    const result = { allTopics: [budget, { title: "日程", summary: "日程を検討しました。" }], currentTopic: budget };
    mocks.create.mockResolvedValue({ status: "completed", output_text: JSON.stringify(result) });
    const signal = new AbortController().signal;
    await expect(generateInsights("secret", input, signal)).resolves.toEqual(result);
    expect(mocks.create).toHaveBeenCalledWith(expect.objectContaining({
      model: "gpt-5.6-luna", reasoning: { effort: "none" }, store: false,
      input: JSON.stringify(input.items),
      text: { format: expect.objectContaining({ type: "json_schema", strict: true }) },
    }), { signal });
  });
  it.each(["", "not json", '{"allTopics":[],"currentTopic":{"title":"x"}}', '{"allTopics":[{"title":"","summary":"x"}],"currentTopic":null}'])("rejects unusable output: %s", async (output_text) => {
    mocks.create.mockResolvedValue({ output_text });
    await expect(generateInsights("secret", input)).rejects.toThrow();
  });
  it("rejects truncated output even if the payload parses", async () => {
    mocks.create.mockResolvedValue({ status: "incomplete", output_text: '{"allTopics":[],"currentTopic":null}' });
    await expect(generateInsights("secret", input)).rejects.toThrow("incomplete");
  });
});
