import { afterEach, describe, expect, it, vi } from "vitest";
import { createFlush } from "@/hooks/use-session/actions/start/flush";
import { defaultSettings } from "@/lib/settings";
import type { Item } from "@/lib/types";
import type { Refs, SetItems } from "@/hooks/use-session/types";
import { setupLiveBrowser } from "../setup/live-audio";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe("Gemini live transcript", () => {
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
