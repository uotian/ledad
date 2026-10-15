import { afterEach, describe, expect, it, vi } from "vitest";
import { createFlush } from "@/hooks/use-session/actions/start/flush";
import { defaultSettings } from "@/lib/settings";
import type { Item } from "@/lib/types";
import type { ItemFlushLastRef, Refs, SetItems } from "@/hooks/use-session/types";
import { setupLiveBrowser } from "../setup/live-audio";

afterEach(() => {
  vi.clearAllTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe("Gemini live transcript", () => {
  async function setup() {
    vi.useFakeTimers();
    vi.spyOn(console, "log").mockImplementation(() => {});
    const browser = setupLiveBrowser();
    browser.fetch.mockImplementation((url: string) => Promise.resolve(
      Response.json(url.includes("gemini/live") ? { token: "token" } : { translation: "translation" }),
    ));
    const refs: Refs = { mic: { current: {} as MediaStream }, flush: { current: null }, final: { current: null } };
    let items: Item[] = [];
    const last: ItemFlushLastRef = { current: null };
    const onBoundary = vi.fn();
    const onError = vi.fn();
    const flush = createFlush(refs, { ...defaultSettings, provider: "gemini" }, last, vi.fn(), onError,
      (update) => { items = typeof update === "function" ? update(items) : update; }, onBoundary);
    refs.flush.current = flush;
    await flush.start();
    const socket = browser.sockets[0];
    socket.send.mockClear();
    const commits = () => socket.send.mock.calls.filter(([data]) => JSON.parse(data).realtimeInput?.audioStreamEnd);
    return { browser, socket, flush, last, onBoundary, onError, commits, get items() { return items; } };
  }

  it("commits a continuous utterance after fifteen seconds without extending the deadline", async () => {
    const state = await setup();
    state.socket.emit({ voiceActivity: { type: "ACTIVITY_START" } });
    for (let i = 0; i < 14; i++) {
      await vi.advanceTimersByTimeAsync(1000);
      state.socket.emit({ serverContent: { interimInputTranscription: { text: `Long speech ${i}` } } });
    }
    expect(state.commits()).toHaveLength(0);
    await vi.advanceTimersByTimeAsync(1000);
    expect(state.commits()).toHaveLength(1);
    expect(state.onBoundary).not.toHaveBeenCalled();
    // Wait for the API's finalized transcript; do not repeatedly commit while it is late.
    state.socket.emit({ serverContent: { interimInputTranscription: { text: "Still pending" } } });
    await vi.advanceTimersByTimeAsync(20000);
    expect(state.commits()).toHaveLength(1);
    state.socket.emit({ serverContent: { inputTranscription: { text: "Final speech" } } });
    expect(state.onBoundary).toHaveBeenCalledExactlyOnceWith(new Date().toISOString());
    expect(state.items[0]).toMatchObject({ transcripts: ["Final speech"], endedAt: new Date().toISOString() });
    expect(state.last.current).toBeNull();
    state.flush.stop();
  });

  it("resets on a natural end and starts a fresh deadline for the next utterance", async () => {
    const state = await setup();
    state.socket.emit({ voiceActivity: { type: "ACTIVITY_START" } });
    await vi.advanceTimersByTimeAsync(10000);
    state.socket.emit({ serverContent: { inputTranscription: { text: "First sentence" } } });
    state.socket.emit({ voiceActivity: { type: "ACTIVITY_END" } });
    await vi.advanceTimersByTimeAsync(20000);
    expect(state.commits()).toHaveLength(0);
    state.socket.emit({ voiceActivity: { type: "ACTIVITY_START" } });
    state.socket.emit({ serverContent: { interimInputTranscription: { text: "Next sentence" } } });
    await vi.advanceTimersByTimeAsync(14999);
    expect(state.commits()).toHaveLength(0);
    await vi.advanceTimersByTimeAsync(1);
    expect(state.commits()).toHaveLength(1);
    expect(state.items.map((item) => item.transcripts[0])).toEqual(["First sentence", "Next sentence"]);
    state.flush.stop();
  });

  it("cancels the deadline when VAD detects silence even if the final text is late", async () => {
    const state = await setup();
    state.socket.emit({ voiceActivity: { voiceActivityType: "ACTIVITY_START" } });
    await vi.advanceTimersByTimeAsync(10000);
    state.socket.emit({ voiceActivity: { voiceActivityType: "ACTIVITY_END" } });
    state.socket.emit({ serverContent: { interimInputTranscription: { text: "Late interim" } } });
    await vi.advanceTimersByTimeAsync(20000);
    expect(state.commits()).toHaveLength(0);
    state.socket.emit({ serverContent: { inputTranscription: { text: "Late final" } } });
    expect(state.onBoundary).toHaveBeenCalledOnce();
    state.flush.stop();
  });

  it("keeps the next VAD deadline when the previous finalized transcript arrives late", async () => {
    const state = await setup();
    state.socket.emit({ voiceActivity: { type: "ACTIVITY_START" } });
    await vi.advanceTimersByTimeAsync(5000);
    state.socket.emit({ voiceActivity: { type: "ACTIVITY_END" } });
    state.socket.emit({ voiceActivity: { type: "ACTIVITY_START" } });
    await vi.advanceTimersByTimeAsync(2000);
    state.socket.emit({ serverContent: { inputTranscription: { text: "Previous utterance" } } });
    await vi.advanceTimersByTimeAsync(13000);
    expect(state.commits()).toHaveLength(1);
    state.flush.stop();
  });

  it("uses the first interim as the deadline when VAD events are unavailable", async () => {
    const state = await setup();
    state.socket.emit({ serverContent: { interimInputTranscription: { text: "Long speech" } } });
    await vi.advanceTimersByTimeAsync(15000);
    expect(state.commits()).toHaveLength(1);
    state.socket.emit({ serverContent: { inputTranscription: { text: "Final speech" } } });
    state.socket.emit({ serverContent: { interimInputTranscription: { text: "Next speech" } } });
    await vi.advanceTimersByTimeAsync(15000);
    expect(state.commits()).toHaveLength(2);
    state.flush.stop();
  });

  it("cancels a pending commit when stopped", async () => {
    const state = await setup();
    state.socket.emit({ voiceActivity: { type: "ACTIVITY_START" } });
    await vi.advanceTimersByTimeAsync(10000);
    state.flush.stop();
    await vi.advanceTimersByTimeAsync(20000);
    expect(state.commits()).toHaveLength(0);
    expect(state.onBoundary).not.toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("stops on commit send failure", async () => {
    const state = await setup();
    state.socket.emit({ voiceActivity: { type: "ACTIVITY_START" } });
    state.socket.send.mockImplementationOnce(() => { throw new Error("offline"); });
    await vi.advanceTimersByTimeAsync(15000);
    expect(state.onError).toHaveBeenCalledWith("Could not commit: offline");
    expect(state.onBoundary).not.toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("streams PCM, updates transcripts, and reports connection errors", async () => {
    const browser = setupLiveBrowser();
    browser.fetch.mockImplementation((url: string) => Promise.resolve(
      url.includes("gemini/live") ? Response.json({ token: "ephemeral-token" }) : Response.json({ translation: "こんにちは。" }),
    ));
    let items: Item[] = [];
    const setItems: SetItems = (update) => { items = typeof update === "function" ? update(items) : update; };
    const refs: Refs = { mic: { current: {} as MediaStream }, flush: { current: null }, final: { current: null } };
    const itemFlushLast = { current: null };
    const setStatus = vi.fn();
    const onError = vi.fn();
    const flush = createFlush(refs, { ...defaultSettings, provider: "gemini" }, itemFlushLast, setStatus, onError, setItems);
    refs.flush.current = flush;
    await flush.start();
    const socket = browser.sockets[0];
    expect(socket.url).toBe("wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContentConstrained?access_token=ephemeral-token");
    expect(setStatus).toHaveBeenLastCalledWith("listening");
    expect(browser.contexts[0].sampleRate).toBe(24000);
    browser.emitAudio();
    expect(JSON.parse(socket.send.mock.lastCall![0])).toEqual({ realtimeInput: { audio: { data: expect.any(String), mimeType: "audio/pcm;rate=24000" } } });
    socket.emit({ serverContent: { interimInputTranscription: { text: "Hel" } } });
    socket.emit({ serverContent: { interimInputTranscription: { text: "Hello" } } });
    expect(items).toHaveLength(1);
    expect(items[0].transcripts).toEqual(["Hello"]);
    await vi.waitFor(() => expect(items[0].translations).toEqual(["こんにちは。"]), { timeout: 2000 });
    expect(items[0]).not.toHaveProperty("endedAt");
    socket.emit({ serverContent: { inputTranscription: { text: "Hello world." } } });
    await vi.waitFor(() => expect(items[0].translations).toEqual(["こんにちは。"]));
    expect(items[0]).toMatchObject({ transcripts: ["Hello world."], endedAt: expect.any(String) });
    expect(itemFlushLast.current).toBeNull();
    vi.useFakeTimers();
    socket.emit({ serverContent: { interimInputTranscription: { text: "Next sentence" } } });
    const requestsBeforeStop = browser.fetch.mock.calls.length;
    socket.emit({ error: { message: "Connection lost" } });
    expect(onError).toHaveBeenCalledWith("Connection lost");
    expect(socket.readyState).toBe(3);
    expect(browser.contexts[0].close).toHaveBeenCalledOnce();
    await vi.advanceTimersByTimeAsync(2000);
    expect(browser.fetch).toHaveBeenCalledTimes(requestsBeforeStop);
  });
});
