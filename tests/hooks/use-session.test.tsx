import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  start: vi.fn(),
  stop: vi.fn(),
  clear: vi.fn(),
  flushStop: vi.fn(),
  cleanup: vi.fn(),
}));

vi.mock("@/hooks/use-session/actions/start", () => ({ start: mocks.start }));
vi.mock("@/hooks/use-session/actions/stop", () => ({ stop: mocks.stop }));
vi.mock("@/hooks/use-session/actions/clear", () => ({ clear: mocks.clear }));
vi.mock("@/hooks/use-session/utils", () => ({ cleanup: mocks.cleanup }));

import { useSession } from "@/hooks/use-session";
import type { Settings } from "@/lib/types";

const settings = { provider: "openai" as const, textSize: "M" as const, langFrom: "en" as const, langTo: "ja" as const, prompt: "A meeting.", keywords: ["GSP"] };

describe("useSession", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mocks.start.mockImplementation(async ({ refs, itemFlushLast, setStatus }) => {
      refs.flush.current = { stop: mocks.flushStop };
      itemFlushLast.current = { id: "1", startedAt: "2026-01-01T00:00:00.000Z", transcripts: ["Hello"], translations: [""], type: "flush" };
      setStatus("listening");
    });
    mocks.stop.mockImplementation((_refs, setStatus) => setStatus("idle"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("starts with the current settings", async () => {
    const { result } = renderHook(() => useSession(settings));

    await act(async () => result.current.start());
    expect(result.current.status).toBe("listening");
    expect(mocks.start).toHaveBeenCalledWith(expect.objectContaining({ settings }));

  });

  it("delegates manual actions and cancels timers when stopped", async () => {
    const { result, unmount } = renderHook(() => useSession({ ...settings, langFrom: "fr", langTo: "zh" }));
    await act(async () => result.current.start());


    act(() => result.current.clear());
    expect(mocks.clear).toHaveBeenCalled();

    act(() => result.current.stop());
    expect(result.current.status).toBe("idle");
    act(() => vi.advanceTimersByTime(30 * 60 * 1000));
    expect(mocks.stop).toHaveBeenCalledOnce();

    unmount();
    expect(mocks.cleanup).toHaveBeenCalled();
  });

  it("stops automatically after thirty minutes", async () => {
    const { result } = renderHook(() => useSession(settings));
    await act(async () => result.current.start());

    act(() => vi.advanceTimersByTime(30 * 60 * 1000));

    expect(mocks.stop).toHaveBeenCalledOnce();
    expect(result.current.status).toBe("idle");
    expect(result.current.error).toBe("Session stopped automatically after 30 minutes.");
  });

  it.each([
    ["OpenAI", settings],
  ])("cancels the %s timer when a connection returns to idle", async (_provider, providerSettings) => {
    const { result } = renderHook(() => useSession(providerSettings));
    await act(async () => result.current.start());
    const { setStatus } = mocks.start.mock.calls.at(-1)![0];

    act(() => setStatus("idle"));
    act(() => vi.advanceTimersByTime(30 * 60 * 1000));

    expect(mocks.stop).not.toHaveBeenCalled();
    expect(result.current.error).toBeNull();
  });

  it("uses the current settings for the next start", async () => {
    const { result, rerender } = renderHook((settings: Settings) => useSession(settings), {
      initialProps: { ...settings, langFrom: "en", langTo: "ja" },
    });
    await act(async () => result.current.start());
    const nextSettings = { ...settings, langFrom: "fr" as const, langTo: "zh" as const };
    rerender(nextSettings);
    await act(async () => result.current.start());
    expect(mocks.start).toHaveBeenLastCalledWith(expect.objectContaining({ settings: nextSettings }));
  });

  it("accepts in-progress transcripts that finish after Clear", async () => {
    vi.setSystemTime(new Date("2026-09-22T00:02:00.000Z"));
    mocks.clear.mockImplementation((_error, setItems) => setItems([]));
    const { result } = renderHook(() => useSession(settings));
    await act(async () => result.current.start());
    const { setItems } = mocks.start.mock.calls.at(-1)![0];
    act(() => result.current.clear());
    act(() => setItems((items: import("@/lib/types").Item[]) => [...items, {
      id: "late", type: "final", startedAt: "2026-09-22T00:00:00.000Z", endedAt: "2026-09-22T00:01:00.000Z", transcripts: ["Old discussion"], translations: [""],
    }]));
    expect(result.current.items.map((item) => item.id)).toEqual(["late"]);
    act(() => setItems((items: import("@/lib/types").Item[]) => [...items, {
      id: "new", type: "flush", startedAt: "2026-09-22T00:02:01.000Z", transcripts: ["New discussion"], translations: [""],
    }]));
    expect(result.current.items.map((item) => item.id)).toEqual(["late", "new"]);
  });

});
