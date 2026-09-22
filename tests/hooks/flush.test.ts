import { waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Flush } from "@/hooks/use-session/actions/start/flush";
import { updateTranslation } from "@/hooks/use-session/actions/start/translate";
import type { ItemFlushLastRef, Refs, SetItems } from "@/hooks/use-session/types";
import type { Item } from "@/lib/types";

const requestSDP = vi.hoisted(() => vi.fn());
const translate = vi.hoisted(() => vi.fn());
vi.mock("@/lib/transcribe", () => ({ requestSDP }));
vi.mock("@/lib/translate", () => ({ translate }));

type Listener = (event: Event) => void;

async function setupFlush({ readyState = "open", send = vi.fn(), initialItems = [] }: { readyState?: RTCDataChannelState; send?: ReturnType<typeof vi.fn>; initialItems?: Item[] } = {}) {
  const listeners = new Map<string, Listener>();
  const channel = {
    readyState,
    send,
    close: vi.fn(),
    addEventListener: vi.fn((type: string, listener: Listener) => listeners.set(type, listener)),
  } as unknown as RTCDataChannel;
  const connection = {
    addTrack: vi.fn(),
    createDataChannel: vi.fn(() => channel),
    createOffer: vi.fn().mockResolvedValue({ type: "offer", sdp: "offer-sdp" }),
    setLocalDescription: vi.fn(),
    setRemoteDescription: vi.fn(),
    getSenders: vi.fn(() => []),
    close: vi.fn(),
  } as unknown as RTCPeerConnection;
  vi.stubGlobal("RTCPeerConnection", function MockRTCPeerConnection() { return connection; });

  let items = initialItems;
  const itemFlushLast: ItemFlushLastRef = { current: null };
  const setError = vi.fn();
  const setItems = vi.fn((next: Item[] | ((current: Item[]) => Item[])) => {
    items = typeof next === "function" ? next(items) : next;
  }) as unknown as SetItems;
  const refs: Refs = {
    mic: { current: { getAudioTracks: () => [] } as unknown as MediaStream },
    flush: { current: null },
    final: { current: null },
  };
  const langs = { from: "en" as const, to: "ja" as const };
  const flush = new Flush(
    refs,
    { textSize: "M", langFrom: "en", langTo: "ja", prompt: "Meeting", keywords: [] },
    langs,
    itemFlushLast,
    vi.fn(),
    setError,
    setItems,
  );
  refs.flush.current = flush;
  await flush.start();

  return {
    get items() { return items; },
    refs,
    langs,
    listeners,
    itemFlushLast,
    setError,
    setItems,
    send,
  };
}

function message(data: unknown) {
  return new MessageEvent<string>("message", { data: JSON.stringify(data) });
}

describe("Flush", () => {
  beforeEach(() => {
    requestSDP.mockResolvedValue("answer-sdp");
    translate.mockImplementation(async ({ text }: { text: string }) => `translated:${text}`);
    vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("reports malformed messages without changing transcript state", async () => {
    const state = await setupFlush();
    state.listeners.get("message")?.(new MessageEvent("message", { data: "not-json" }));

    expect(state.setError).toHaveBeenCalledWith("Could not read speech event.");
    expect(state.items).toEqual([]);
  });

  it("surfaces Realtime API errors", async () => {
    const state = await setupFlush();
    state.listeners.get("message")?.(message({ type: "error", error: { message: "rate limited" } }));

    expect(state.setError).toHaveBeenCalledWith("rate limited");
    expect(translate).not.toHaveBeenCalled();
  });

  it("accumulates partial transcript deltas without translating too early", async () => {
    const state = await setupFlush();
    state.listeners.get("message")?.(message({ type: "conversation.item.input_audio_transcription.delta", delta: "Hello" }));
    state.listeners.get("message")?.(message({ type: "conversation.item.input_audio_transcription.delta", delta: " world" }));

    expect(state.items).toHaveLength(1);
    expect(state.items[0].transcripts).toEqual(["Hello world"]);
    expect(state.itemFlushLast.current?.transcripts).toEqual(["Hello world"]);
    expect(translate).not.toHaveBeenCalled();
  });

  it("splits punctuation, finalizes a sentence, and stores its latest translation", async () => {
    const state = await setupFlush();
    state.listeners.get("message")?.(message({ type: "conversation.item.input_audio_transcription.delta", delta: "Hello, world." }));

    expect(state.items[0].transcripts).toEqual(["Hello, world."]);
    expect(state.items[0].startedAt).toEqual(expect.any(String));
    expect(state.items[0].endedAt).toEqual(expect.any(String));
    expect(state.itemFlushLast.current).toBeNull();
    expect(translate).toHaveBeenNthCalledWith(1, { langFrom: "en", langTo: "ja", text: "Hello," });
    expect(translate).toHaveBeenNthCalledWith(2, { langFrom: "en", langTo: "ja", text: "Hello, world." });
    await waitFor(() => expect(state.items[0].translations).toEqual(["translated:Hello, world."]));
  });

  it("updates a completed item without overwriting a newer active item", async () => {
    const oldItem = { id: "old", startedAt: "2026-01-01T00:00:00.000Z", transcripts: ["Hello"] as [string], translations: [""] as [string], type: "flush" as const };
    const activeItem = { id: "active", startedAt: "2026-01-01T00:00:01.000Z", transcripts: ["Next"] as [string], translations: [""] as [string], type: "flush" as const };
    const state = await setupFlush({ initialItems: [oldItem, activeItem] });
    state.itemFlushLast.current = activeItem;

    await updateTranslation(oldItem, { from: "en", to: "fr" }, state.itemFlushLast, state.setItems);

    expect(state.itemFlushLast.current).toEqual(activeItem);
    expect(state.items).toEqual([{ ...oldItem, translations: ["translated:Hello"] }, activeItem]);
  });

  it("does nothing when there is no transcript to finalize", async () => {
    const state = await setupFlush();
    state.refs.flush.current?.finalize();

    expect(translate).not.toHaveBeenCalled();
    expect(state.items).toEqual([]);
  });

  it("preserves the previous translation when a later request fails", async () => {
    const item = { id: "active", startedAt: "2026-01-01T00:00:00.000Z", transcripts: ["Hello world"] as [string], translations: ["こんにちは"] as [string], type: "flush" as const };
    const state = await setupFlush({ initialItems: [item] });
    state.itemFlushLast.current = item;
    translate.mockResolvedValueOnce(null);

    await updateTranslation(item, state.langs, state.itemFlushLast, state.setItems);

    expect(state.items).toEqual([item]);
    expect(state.itemFlushLast.current).toEqual(item);
  });

  it("sends a commit event through an open channel", async () => {
    const state = await setupFlush();
    vi.spyOn(crypto, "randomUUID").mockReturnValue("event-id");

    state.refs.flush.current?.commit();

    expect(state.setError).toHaveBeenCalledWith(null);
    expect(state.send).toHaveBeenCalledWith(JSON.stringify({ event_id: "commit_event-id", type: "input_audio_buffer.commit" }));
  });

  it("rejects a commit when the channel is not open", async () => {
    const state = await setupFlush({ readyState: "closed" });

    state.refs.flush.current?.commit();

    expect(state.send).not.toHaveBeenCalled();
    expect(state.setError).toHaveBeenCalledWith("Could not commit: the session is not listening.");
  });

  it("reports channel send failures", async () => {
    const state = await setupFlush({ send: vi.fn(() => { throw new Error("channel closed"); }) });

    state.refs.flush.current?.commit();

    expect(state.setError).toHaveBeenLastCalledWith("Could not commit: channel closed");
  });
});
