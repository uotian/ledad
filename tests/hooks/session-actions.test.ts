import { describe, expect, it, vi } from "vitest";
import { clear } from "@/hooks/use-session/actions/clear";
import { stop } from "@/hooks/use-session/actions/stop";
import type { ItemFlushLastRef, Refs } from "@/hooks/use-session/types";
import { cleanup } from "@/hooks/use-session/utils";

function createRefs() {
  const flushStop = vi.fn();
  const finalStop = vi.fn();
  const micTrackStop = vi.fn();
  const refs = {
    flush: { current: { stop: flushStop } },
    mic: { current: { getTracks: () => [{ stop: micTrackStop }] } as unknown as MediaStream },
    final: { current: { stop: finalStop } },
  } satisfies Refs;

  return { refs, flushStop, finalStop, micTrackStop };
}

describe("session actions", () => {
  it("clears errors, items, and the active transcript", () => {
    const setError = vi.fn();
    const setItems = vi.fn();
    const itemFlushLast = { current: { id: "1", startedAt: "2026-01-01T00:00:00.000Z", transcripts: ["Hello"], translations: [""], type: "flush" } } as ItemFlushLastRef;

    clear(setError, setItems, itemFlushLast);

    expect(setError).toHaveBeenCalledWith(null);
    expect(setItems).toHaveBeenCalledWith([]);
    expect(itemFlushLast.current).toBeNull();
  });

  it("stops every media resource and clears the refs", () => {
    const { refs, flushStop, finalStop, micTrackStop } = createRefs();

    cleanup(refs);

    expect(flushStop).toHaveBeenCalledOnce();
    expect(finalStop).toHaveBeenCalledOnce();
    expect(micTrackStop).toHaveBeenCalledOnce();
    expect(refs.flush.current).toBeNull();
    expect(refs.final.current).toBeNull();
    expect(refs.mic.current).toBeNull();
  });

  it("moves the session to idle after stopping", () => {
    const { refs } = createRefs();
    const setStatus = vi.fn();

    stop(refs, setStatus);

    expect(setStatus).toHaveBeenCalledWith("idle");
    expect(refs.flush.current).toBeNull();
  });
});
