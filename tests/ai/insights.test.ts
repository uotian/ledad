import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ create: vi.fn() }));
vi.mock("openai", () => ({ default: class { responses = { create: mocks.create }; } }));
import { generateInsights } from "@/ai/openai/insights";
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
      model: "gpt-6-luna", reasoning: { effort: "none" }, store: false,
      input: [{ role: "user", content: [{ type: "input_text", text: JSON.stringify(input.items[0]) }] }],
      prompt_cache_options: { mode: "explicit" },
      text: { format: expect.objectContaining({ type: "json_schema", strict: true }) },
    }), { signal });
  });
  it("preserves final message boundaries as the transcript grows and caches only the stable prefix", async () => {
    mocks.create.mockResolvedValue({ status: "completed", output_text: '{"allTopics":[],"currentTopic":null}' });
    const final = { ...input.items[0], id: "final", type: "final" as const, endedAt: "2026-09-22T00:01:00Z" };
    await generateInsights("secret", { ...input, items: [final] });
    const originalMessage = mocks.create.mock.calls[0][0].input[0];
    expect(originalMessage).toEqual({ role: "user", content: [{ type: "input_text", text: JSON.stringify(final), prompt_cache_breakpoint: { mode: "explicit" } }] });

    const draft = { ...input.items[0], transcripts: ["The next topic is the schedule."] };
    const nextFinal = { ...final, id: "next-final" };
    await generateInsights("secret", { ...input, items: [final, draft, nextFinal] });
    const messages = mocks.create.mock.calls[1][0].input;
    expect(messages).toHaveLength(3);
    expect(messages[0]).toEqual(originalMessage);
    expect(messages.map((message: { content: { text: string }[] }) => JSON.parse(message.content[0].text))).toEqual([final, draft, nextFinal]);
    expect(messages[1].content[0].prompt_cache_breakpoint).toBeUndefined();
    expect(messages[2].content[0].prompt_cache_breakpoint).toBeUndefined();

    await generateInsights("secret", { ...input, items: [final, nextFinal] });
    expect(mocks.create.mock.calls[2][0].input[0]).toEqual(originalMessage);
    expect(mocks.create.mock.calls[2][0].input[1].content[0].prompt_cache_breakpoint).toEqual({ mode: "explicit" });
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
