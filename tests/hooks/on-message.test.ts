import { waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Item } from "@/lib/types";
import type { ItemFlushLastRef, SetItems } from "@/hooks/use-session/types";

const translate = vi.hoisted(() => vi.fn());

vi.mock("@/lib/translate", () => ({ translate }));

import { finalizeItemFlush, onMessage, updateTranslation } from "@/hooks/use-session/actions/start/on-message";

function createState(initialItems: Item[] = []) {
  let items = initialItems;
  const itemFlushLast: ItemFlushLastRef = { current: null };
  const setError = vi.fn();
  const setItems = vi.fn((next: Item[] | ((current: Item[]) => Item[])) => {
    items = typeof next === "function" ? next(items) : next;
  }) as unknown as SetItems;

  return {
    get items() {
      return items;
    },
    itemFlushLast,
    setError,
    setItems,
  };
}

function event(data: unknown) {
  return new MessageEvent<string>("message", { data: JSON.stringify(data) });
}

describe("Realtime message handling", () => {
  beforeEach(() => {
    translate.mockImplementation(async ({ text }: { text: string }) => `translated:${text}`);
    vi.spyOn(console, "log").mockImplementation(() => {});
  });

  it("reports malformed messages without changing transcript state", () => {
    const state = createState();

    onMessage(new MessageEvent("message", { data: "not-json" }), { from: "en", to: "ja" }, state.itemFlushLast, state.setError, state.setItems);

    expect(state.setError).toHaveBeenCalledWith("Could not read speech event.");
    expect(state.items).toEqual([]);
  });

  it("surfaces Realtime API errors", () => {
    const state = createState();

    onMessage(event({ type: "error", error: { message: "rate limited" } }), { from: "en", to: "ja" }, state.itemFlushLast, state.setError, state.setItems);

    expect(state.setError).toHaveBeenCalledWith("rate limited");
    expect(translate).not.toHaveBeenCalled();
  });

  it("accumulates partial transcript deltas without translating too early", () => {
    const state = createState();

    onMessage(event({ type: "conversation.item.input_audio_transcription.delta", delta: "Hello" }), { from: "en", to: "ja" }, state.itemFlushLast, state.setError, state.setItems);
    onMessage(event({ type: "conversation.item.input_audio_transcription.delta", delta: " world" }), { from: "en", to: "ja" }, state.itemFlushLast, state.setError, state.setItems);

    expect(state.items).toHaveLength(1);
    expect(state.items[0].transcript).toBe("Hello world");
    expect(state.itemFlushLast.current?.transcript).toBe("Hello world");
    expect(translate).not.toHaveBeenCalled();
  });

  it("splits punctuation, finalizes a sentence, and stores its latest translation", async () => {
    const state = createState();

    onMessage(event({
      type: "conversation.item.input_audio_transcription.delta",
      delta: "Hello, world.",
    }), { from: "en", to: "ja" }, state.itemFlushLast, state.setError, state.setItems);

    expect(state.items[0].transcript).toBe("Hello, world.");
    expect(state.items[0].startedAt).toEqual(expect.any(String));
    expect(state.items[0].endedAt).toEqual(expect.any(String));
    expect(state.itemFlushLast.current).toBeNull();
    expect(translate).toHaveBeenNthCalledWith(1, { langFrom: "en", langTo: "ja", text: "Hello," });
    expect(translate).toHaveBeenNthCalledWith(2, { langFrom: "en", langTo: "ja", text: "Hello, world." });
    await waitFor(() => {
      expect(state.items[0].translation).toBe("translated:Hello, world.");
    });
  });

  it("updates a completed item without overwriting a newer active item", async () => {
    const oldItem = { id: "old", startedAt: "2026-01-01T00:00:00.000Z", transcript: "Hello", translation: "", type: "flush" as const };
    const activeItem = { id: "active", startedAt: "2026-01-01T00:00:01.000Z", transcript: "Next", translation: "", type: "flush" as const };
    const state = createState([oldItem, activeItem]);
    state.itemFlushLast.current = activeItem;

    await updateTranslation(oldItem, { from: "en", to: "fr" }, state.itemFlushLast, state.setItems);

    expect(state.itemFlushLast.current).toEqual(activeItem);
    expect(state.items).toEqual([
      { ...oldItem, translation: "translated:Hello" },
      activeItem,
    ]);
  });

  it("does nothing when there is no transcript to finalize", () => {
    const state = createState();

    finalizeItemFlush(state.itemFlushLast, { from: "en", to: "ja" }, state.setItems);

    expect(translate).not.toHaveBeenCalled();
    expect(state.items).toEqual([]);
  });

  it("preserves the previous translation when a later request fails", async () => {
    const item = { id: "active", startedAt: "2026-01-01T00:00:00.000Z", transcript: "Hello world", translation: "こんにちは", type: "flush" as const };
    const state = createState([item]);
    state.itemFlushLast.current = item;
    translate.mockResolvedValueOnce(null);

    await updateTranslation(item, { from: "en", to: "ja" }, state.itemFlushLast, state.setItems);

    expect(state.items).toEqual([item]);
    expect(state.itemFlushLast.current).toEqual(item);
  });
});
