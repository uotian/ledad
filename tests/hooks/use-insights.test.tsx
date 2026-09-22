import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useInsights, INSIGHTS_INTERVAL_MS } from "@/hooks/use-insights";
import type { Item } from "@/lib/types";
import type { InsightsResult } from "@/lib/insights";

const generateInsights = vi.hoisted(() => vi.fn());
vi.mock("@/lib/insights", async (original) => ({ ...await original<typeof import("@/lib/insights")>(), generateInsights }));

const item: Item = { id: "draft", type: "flush", startedAt: "2026-09-22T00:00:10.000Z", endedAt: "2026-09-22T00:00:20.000Z", transcripts: ["We should migrate the index."], translations: [""] };
const data: InsightsResult = { allTopics: [{ title: "Index migration", summary: "Discussing the index migration." }], currentTopic: { title: "Index migration", summary: "Reviewing the schedule." } };
const initial = { items: [item] as Item[], enabled: true };
const advance = (ms = INSIGHTS_INTERVAL_MS) => act(async () => { await vi.advanceTimersByTimeAsync(ms); });

function setup(props = initial) {
  return renderHook(({ items, enabled }) => useInsights(items, enabled, "ja"), { initialProps: props });
}

beforeEach(() => {
  vi.useFakeTimers();
  generateInsights.mockReset().mockResolvedValue(data);
});
afterEach(() => vi.useRealTimers());

describe("topic updates", () => {
  it("waits one minute, uses untranslated text, and skips unchanged input", async () => {
    const { result, rerender } = setup();
    await advance(59_999);
    expect(generateInsights).not.toHaveBeenCalled();
    await advance(1);
    expect(generateInsights).toHaveBeenCalledWith({ lang: "ja", items: [item] }, expect.any(AbortSignal));
    expect(result.current.data).toEqual(data);
    await advance(60_000);
    expect(generateInsights).toHaveBeenCalledTimes(1);

    rerender({ ...initial, items: [{ ...item, translations: ["インデックスを移行しましょう。"] }] });
    await advance();
    expect(generateInsights).toHaveBeenCalledTimes(2);
  });

  it("does not send while disabled", async () => {
    setup({ ...initial, enabled: false });
    await advance(60_000);
    expect(generateInsights).not.toHaveBeenCalled();
  });

  it("does not send empty or whitespace transcripts", async () => {
    const { rerender } = setup({ ...initial, items: [] });
    await advance();
    rerender({ ...initial, items: [{ ...item, transcripts: ["  "] }] });
    await advance();
    expect(generateInsights).not.toHaveBeenCalled();
  });

  it("sends the whole selected timeline, replacing covered drafts with final items", async () => {
    const { rerender } = setup();
    await advance();
    const final: Item = { ...item, id: "final", type: "final", startedAt: "2026-09-22T00:00:00.000Z", endedAt: "2026-09-22T00:01:00.000Z", transcripts: ["We will migrate the index."] };
    const next: Item = { ...item, id: "next", startedAt: "2026-09-22T00:01:01.000Z", endedAt: undefined, transcripts: ["Now the release."] };
    rerender({ ...initial, items: [item, final, next] });
    await advance();
    expect(generateInsights).toHaveBeenLastCalledWith({ lang: "ja", items: [final, next] }, expect.any(AbortSignal));
  });

  it("skips ticks during a request then reads the newest snapshot", async () => {
    let resolve!: (value: InsightsResult) => void;
    generateInsights.mockReturnValueOnce(new Promise<InsightsResult>((done) => { resolve = done; }));
    const { result, rerender } = setup();
    await advance(30_000);
    act(() => result.current.refresh());
    const changed = { ...item, transcripts: ["The launch is Friday."] };
    rerender({ ...initial, items: [changed] });
    await advance(30_000);
    expect(generateInsights).toHaveBeenCalledTimes(1);
    await act(async () => resolve(data));
    await advance();
    expect(generateInsights).toHaveBeenLastCalledWith({ lang: "ja", items: [changed] }, expect.any(AbortSignal));
  });

  it("preserves the last success on failure and retries on the next tick", async () => {
    const { result, rerender } = setup();
    await advance();
    generateInsights.mockRejectedValueOnce(new Error("offline"));
    rerender({ ...initial, items: [{ ...item, transcripts: ["Next topic"] }] });
    await advance();
    expect(result.current.data).toEqual(data);
    expect(result.current.error).toBeTruthy();
    await advance();
    expect(generateInsights).toHaveBeenCalledTimes(3);
    expect(result.current.error).toBeNull();
  });

  it("stops immediately, aborts an in-flight call, and ignores late results", async () => {
    const { result, rerender } = setup();
    await advance();
    let resolve!: (value: InsightsResult) => void;
    generateInsights.mockReturnValueOnce(new Promise<InsightsResult>((done) => { resolve = done; }));
    rerender({ ...initial, items: [{ ...item, transcripts: ["New text"] }] });
    await advance();
    const signal = generateInsights.mock.calls[1][1] as AbortSignal;
    rerender({ ...initial, enabled: false });
    expect(signal.aborted).toBe(true);
    expect(vi.getTimerCount()).toBe(0);
    await act(async () => resolve({ allTopics: [], currentTopic: null }));
    await advance(60_000);
    expect(generateInsights).toHaveBeenCalledTimes(2);
    expect(result.current.data).toEqual(data);
  });

  it("keeps in-flight analysis when items are cleared and uses new items on the next tick", async () => {
    let resolve!: (value: InsightsResult) => void;
    generateInsights.mockReturnValueOnce(new Promise<InsightsResult>((done) => { resolve = done; }));
    const { result, rerender } = setup();
    await advance();
    const signal = generateInsights.mock.calls[0][1] as AbortSignal;
    rerender({ ...initial, items: [] });
    expect(signal.aborted).toBe(false);
    await act(async () => resolve(data));
    await advance();
    expect(result.current.data).toEqual(data);
    expect(result.current.canRefresh).toBe(false);
    expect(generateInsights).toHaveBeenCalledTimes(1);
    const next = { ...item, id: "next", transcripts: ["A new discussion."] };
    rerender({ ...initial, items: [next] });
    await advance();
    expect(generateInsights).toHaveBeenLastCalledWith({ lang: "ja", items: [next] }, expect.any(AbortSignal));
    expect(result.current.data).toEqual(data);
  });

  it("retains successful insights when items are cleared without resetting the timer", async () => {
    const { result, rerender } = setup();
    await advance();
    await advance(10_000);
    rerender({ ...initial, items: [] });
    expect(result.current.data).toEqual(data);
    await advance(20_000);
    rerender({ ...initial, items: [{ ...item, id: "new" }] });
    await advance(29_999);
    expect(generateInsights).toHaveBeenCalledTimes(1);
    await advance(1);
    expect(generateInsights).toHaveBeenCalledTimes(2);
  });

  it("aborts requests and removes timers on unmount", async () => {
    generateInsights.mockReturnValueOnce(new Promise(() => {}));
    const { unmount } = setup();
    await advance();
    const signal = generateInsights.mock.calls[0][1] as AbortSignal;
    unmount();
    expect(signal.aborted).toBe(true);
    expect(vi.getTimerCount()).toBe(0);
  });

  it("times out a stalled request so future updates are not blocked forever", async () => {
    generateInsights.mockImplementationOnce((_input, signal: AbortSignal) => new Promise((_resolve, reject) => {
      signal.addEventListener("abort", () => reject(new Error("timeout")));
    }));
    const { result } = setup();
    await advance();
    await advance(60_000);
    await advance();
    expect(generateInsights).toHaveBeenCalledTimes(2);
    expect(result.current.data).toEqual(data);
  });

  it("manually resends unchanged input and blocks double clicks until completion", async () => {
    const { result } = setup();
    await advance();
    expect(result.current.canRefresh).toBe(true);
    let resolve!: (value: InsightsResult) => void;
    generateInsights.mockReturnValueOnce(new Promise<InsightsResult>((done) => { resolve = done; }));
    act(() => {
      result.current.refresh();
      result.current.refresh();
    });
    expect(generateInsights).toHaveBeenCalledTimes(2);
    expect(result.current.updating).toBe(true);
    expect(result.current.canRefresh).toBe(false);
    await act(async () => resolve(data));
    expect(result.current.updating).toBe(false);
    expect(result.current.canRefresh).toBe(true);
    await advance();
    expect(generateInsights).toHaveBeenCalledTimes(2);
  });

  it("does not manually send while stopped or when transcripts are empty", () => {
    const { result, rerender } = setup({ ...initial, enabled: false });
    expect(result.current.canRefresh).toBe(false);
    act(() => result.current.refresh());
    rerender({ ...initial, items: [] });
    expect(result.current.canRefresh).toBe(false);
    act(() => result.current.refresh());
    expect(generateInsights).not.toHaveBeenCalled();
  });

  it("allows manual retry after failure and clears busy state on cancellation", async () => {
    generateInsights.mockRejectedValueOnce(new Error("offline"));
    const { result, rerender } = setup();
    await act(async () => result.current.refresh());
    expect(result.current.updating).toBe(false);
    expect(result.current.canRefresh).toBe(true);
    let resolve!: (value: InsightsResult) => void;
    generateInsights.mockReturnValueOnce(new Promise<InsightsResult>((done) => { resolve = done; }));
    act(() => result.current.refresh());
    expect(result.current.updating).toBe(true);
    rerender({ ...initial, enabled: false });
    expect(result.current.updating).toBe(false);
    // A late cancelled result cannot clear the busy state of a new request.
    rerender(initial);
    generateInsights.mockReturnValueOnce(new Promise(() => {}));
    act(() => result.current.refresh());
    await act(async () => resolve(data));
    expect(result.current.updating).toBe(true);
    rerender({ ...initial, enabled: false });
    expect(result.current.updating).toBe(false);
    expect(result.current.canRefresh).toBe(false);
  });
});
