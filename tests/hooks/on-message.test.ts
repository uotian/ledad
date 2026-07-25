import { waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Item } from "@/lib/types";
import type { ItemLastRef, SetItems } from "@/hooks/use-session/types";

const translate = vi.hoisted(() => vi.fn());

vi.mock("@/lib/translate", () => ({ translate }));

import { finalizeTranscript, onMessage, updateTranslation } from "@/hooks/use-session/actions/start/on-message";

function createState(initialItems: Item[] = []) {
  let items = initialItems;
  const itemLast: ItemLastRef = { current: null };
  const setError = vi.fn();
  const setItems = vi.fn((next: Item[] | ((current: Item[]) => Item[])) => {
    items = typeof next === "function" ? next(items) : next;
  }) as unknown as SetItems;

  return {
    get items() {
      return items;
    },
    itemLast,
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

    onMessage(new MessageEvent("message", { data: "not-json" }), { from: "en", to: "ja" }, state.itemLast, state.setError, state.setItems);

    expect(state.setError).toHaveBeenCalledWith("Could not read speech event.");
    expect(state.items).toEqual([]);
  });

  it("surfaces Realtime API errors", () => {
    const state = createState();

    onMessage(event({ type: "error", error: { message: "rate limited" } }), { from: "en", to: "ja" }, state.itemLast, state.setError, state.setItems);

    expect(state.setError).toHaveBeenCalledWith("rate limited");
    expect(translate).not.toHaveBeenCalled();
  });

  it("accumulates partial transcript deltas without translating too early", () => {
    const state = createState();

    onMessage(event({ type: "conversation.item.input_audio_transcription.delta", delta: "Hello" }), { from: "en", to: "ja" }, state.itemLast, state.setError, state.setItems);
    onMessage(event({ type: "conversation.item.input_audio_transcription.delta", delta: " world" }), { from: "en", to: "ja" }, state.itemLast, state.setError, state.setItems);

    expect(state.items).toHaveLength(1);
    expect(state.items[0].transcript).toBe("Hello world");
    expect(state.itemLast.current?.transcript).toBe("Hello world");
    expect(translate).not.toHaveBeenCalled();
  });

  it("splits punctuation, finalizes a sentence, and stores its latest translation", async () => {
    const state = createState();

    onMessage(event({
      type: "conversation.item.input_audio_transcription.delta",
      delta: "Hello, world.",
    }), { from: "en", to: "ja" }, state.itemLast, state.setError, state.setItems);

    expect(state.items[0].transcript).toBe("Hello, world.");
    expect(state.itemLast.current).toBeNull();
    expect(translate).toHaveBeenNthCalledWith(1, { langFrom: "en", langTo: "ja", text: "Hello," });
    expect(translate).toHaveBeenNthCalledWith(2, { langFrom: "en", langTo: "ja", text: "Hello, world." });
    await waitFor(() => {
      expect(state.items[0].translation).toBe("translated:Hello, world.");
    });
  });

  it("updates a completed item without overwriting a newer active item", async () => {
    const oldItem = { id: "old", transcript: "Hello", translation: "" };
    const activeItem = { id: "active", transcript: "Next", translation: "" };
    const state = createState([oldItem, activeItem]);
    state.itemLast.current = activeItem;

    await updateTranslation(oldItem, { from: "en", to: "fr" }, state.itemLast, state.setItems);

    expect(state.itemLast.current).toEqual(activeItem);
    expect(state.items).toEqual([
      { ...oldItem, translation: "translated:Hello" },
      activeItem,
    ]);
  });

  it("does nothing when there is no transcript to finalize", () => {
    const state = createState();

    finalizeTranscript(state.itemLast, { from: "en", to: "ja" }, state.setItems);

    expect(translate).not.toHaveBeenCalled();
    expect(state.items).toEqual([]);
  });
});
