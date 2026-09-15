import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  start: vi.fn(),
  stop: vi.fn(),
  clear: vi.fn(),
  commit: vi.fn(),
  cleanup: vi.fn(),
  finalizeTranscript: vi.fn(),
  updateTranslation: vi.fn(),
}));

vi.mock("@/hooks/use-session/actions/start", () => ({ start: mocks.start }));
vi.mock("@/hooks/use-session/actions/stop", () => ({ stop: mocks.stop }));
vi.mock("@/hooks/use-session/actions/clear", () => ({ clear: mocks.clear }));
vi.mock("@/hooks/use-session/actions/commit", () => ({ commit: mocks.commit }));
vi.mock("@/hooks/use-session/utils", () => ({ cleanup: mocks.cleanup }));
vi.mock("@/hooks/use-session/actions/start/on-message", () => ({
  finalizeTranscript: mocks.finalizeTranscript,
  updateTranslation: mocks.updateTranslation,
}));

import { useSession } from "@/hooks/use-session";
import type { Settings } from "@/lib/types";

const settings = { textSize: "M" as const, langFrom: "en" as const, langTo: "ja" as const, prompt: "A meeting.", keywords: ["GSP"] };

describe("useSession", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mocks.commit.mockReturnValue(true);
    mocks.start.mockImplementation(async ({ refs, itemLast, setStatus }) => {
      refs.channel.current = { close: vi.fn() };
      itemLast.current = { id: "1", transcript: "Hello", translation: "" };
      setStatus("listening");
    });
    mocks.stop.mockImplementation((_refs, setStatus) => setStatus("idle"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("starts, periodically commits, and translates the active item", async () => {
    const { result } = renderHook(() => useSession(settings));

    await act(async () => result.current.start());
    expect(result.current.status).toBe("listening");
    expect(mocks.start).toHaveBeenCalledWith(expect.objectContaining({ settings }));

    act(() => vi.advanceTimersByTime(15_000));

    expect(mocks.commit).toHaveBeenCalledOnce();
    expect(mocks.updateTranslation).toHaveBeenCalledWith(
      { id: "1", transcript: "Hello", translation: "" },
      { from: "en", to: "ja" },
      expect.any(Object),
      expect.any(Function),
    );
  });

  it("delegates manual actions and cancels timers when stopped", async () => {
    const { result, unmount } = renderHook(() => useSession({ ...settings, langFrom: "fr", langTo: "zh" }));
    await act(async () => result.current.start());

    act(() => result.current.commit());
    expect(mocks.finalizeTranscript).toHaveBeenCalledWith(
      expect.any(Object),
      { from: "fr", to: "zh" },
      expect.any(Function),
    );

    act(() => result.current.clear());
    expect(mocks.clear).toHaveBeenCalled();

    act(() => result.current.stop());
    expect(result.current.status).toBe("idle");
    act(() => vi.advanceTimersByTime(15_000));
    expect(mocks.commit).toHaveBeenCalledOnce();

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
  it("uses the current settings for manual commits and the next start", async () => {
    const { result, rerender } = renderHook((settings: Settings) => useSession(settings), {
      initialProps: { ...settings, langFrom: "en", langTo: "ja" },
    });
    await act(async () => result.current.start());
    const nextSettings = { ...settings, langFrom: "fr" as const, langTo: "zh" as const };
    rerender(nextSettings);
    act(() => result.current.commit());
    expect(mocks.finalizeTranscript).toHaveBeenLastCalledWith(expect.any(Object), { from: "fr", to: "zh" }, expect.any(Function));
    await act(async () => result.current.start());
    expect(mocks.start).toHaveBeenLastCalledWith(expect.objectContaining({ settings: nextSettings }));
    act(() => result.current.commit());
    expect(mocks.finalizeTranscript).toHaveBeenLastCalledWith(expect.any(Object), { from: "fr", to: "zh" }, expect.any(Function));
  });

});
