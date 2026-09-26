import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { start, type StartArgs } from "@/hooks/use-session/actions/start";
import { stop } from "@/hooks/use-session/actions/stop";
import { defaultSettings } from "@/lib/settings";
import type { TranscriptionProvider } from "@/lib/types";
import { setupLiveBrowser } from "../setup/live-audio";

function setup(provider: TranscriptionProvider = "openai", autoReady = true, audioReady?: Promise<void>) {
  const browser = setupLiveBrowser({ autoReady, audioReady });
  const trackStop = vi.fn();
  const stream = { getTracks: () => [{ stop: trackStop }] } as unknown as MediaStream;
  const getUserMedia = vi.fn().mockResolvedValue(stream);
  const recorderStop = vi.fn();
  vi.stubGlobal("navigator", { mediaDevices: { getUserMedia } });
  vi.stubGlobal("MediaRecorder", class {
    static isTypeSupported() { return true; }
    mimeType = "audio/webm;codecs=opus";
    state = "inactive";
    addEventListener() {}
    start() { this.state = "recording"; }
    stop() { this.state = "inactive"; recorderStop(); }
  });
  const args: StartArgs = {
    refs: { mic: { current: null }, flush: { current: null }, final: { current: null } },
    settings: { ...defaultSettings, provider },
    setStatus: vi.fn(), setError: vi.fn(), setItems: vi.fn(), itemFlushLast: { current: null },
  };
  return { browser, args, stream, trackStop, recorderStop, getUserMedia };
}

beforeEach(() => vi.useFakeTimers());
afterEach(() => { vi.clearAllTimers(); vi.useRealTimers(); vi.unstubAllGlobals(); });

describe("session start", () => {
  it("reports initialization failures before requesting the microphone", async () => {
    const { args, getUserMedia } = setup();
    vi.stubGlobal("AbortController", class {
      constructor() { throw new Error("Initialization failed"); }
    });

    await start(args);

    expect(args.setStatus).toHaveBeenLastCalledWith("idle");
    expect(args.setError).toHaveBeenLastCalledWith("Could not start: Initialization failed");
    expect(args.refs.flush.current).toBeNull();
    expect(getUserMedia).not.toHaveBeenCalled();
  });

  it.each(["openai"] as const)("starts %s live and final transcription from one microphone", async (provider) => {
    const { browser, args, getUserMedia, trackStop, recorderStop } = setup(provider);
    await start(args);

    expect(getUserMedia).toHaveBeenCalledExactlyOnceWith({ audio: true });
    expect(browser.fetch).toHaveBeenCalledWith(`/api/transcribe/${provider}/live`, expect.objectContaining({ body: JSON.stringify({ settings: args.settings }) }));
    expect(args.setStatus).toHaveBeenNthCalledWith(1, "requesting");
    expect(args.setStatus).toHaveBeenNthCalledWith(2, "connecting");
    expect(args.setStatus).toHaveBeenLastCalledWith("listening");
    expect(browser.contexts[0].sampleRate).toBe(24000);
    expect(args.refs.final.current).not.toBeNull();
    stop(args.refs, args.setStatus);
    expect(trackStop).toHaveBeenCalledOnce();
    expect(recorderStop).toHaveBeenCalledOnce();
    expect(browser.contexts[0].close).toHaveBeenCalledOnce();
    expect(browser.sockets[0].readyState).toBe(3);
    expect(vi.getTimerCount()).toBe(0);
  });

  it.each(["openai"] as const)("cleans up %s after a token request fails", async (provider) => {
    const { browser, args, trackStop, recorderStop } = setup(provider);
    browser.fetch.mockResolvedValueOnce(Response.json({ error: "Token failed" }, { status: 502 }));
    await start(args);
    expect(args.setStatus).toHaveBeenLastCalledWith("idle");
    expect(args.setError).toHaveBeenLastCalledWith("Could not start: Token failed");
    expect(trackStop).toHaveBeenCalledOnce();
    expect(recorderStop).toHaveBeenCalledOnce();
    expect(args.refs).toEqual({ mic: { current: null }, flush: { current: null }, final: { current: null } });
    expect(vi.getTimerCount()).toBe(0);
  });

  it.each(["openai"] as const)("stops all %s resources after an unexpected disconnection", async (provider) => {
    const { browser, args, recorderStop, trackStop } = setup(provider);
    await start(args);
    browser.sockets[0].close();
    expect(args.setStatus).toHaveBeenLastCalledWith("idle");
    expect(args.setError).toHaveBeenLastCalledWith("Realtime connection closed. Please start again.");
    expect(recorderStop).toHaveBeenCalledOnce();
    expect(trackStop).toHaveBeenCalledOnce();
    expect(browser.contexts[0].close).toHaveBeenCalledOnce();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("reports microphone permission failures", async () => {
    const { args, getUserMedia } = setup();
    getUserMedia.mockRejectedValueOnce(new Error("Permission denied"));
    await start(args);
    expect(args.setStatus).toHaveBeenLastCalledWith("idle");
    expect(args.setError).toHaveBeenLastCalledWith("Could not start: Permission denied");
  });

  it.each(["openai"] as const)("sends %s audio immediately and stops if the upload stalls", async (provider) => {
    const { args, browser, trackStop } = setup(provider);
    await start(args);
    const socket = browser.sockets[0];
    socket.send.mockClear();
    browser.emitAudio();
    const message = JSON.parse(socket.send.mock.calls[0][0]);
    const audio = message.audio;
    expect(atob(audio)).toHaveLength(4800); // 100 ms of 24 kHz, 16-bit mono PCM.
    socket.bufferedAmount = 256 * 1024 + 1;
    browser.emitAudio();
    expect(args.setError).toHaveBeenLastCalledWith("Audio upload is falling behind. Please start again.");
    expect(args.setStatus).toHaveBeenLastCalledWith("idle");
    expect(trackStop).toHaveBeenCalledOnce();
    expect(vi.getTimerCount()).toBe(0);
  });


  it("cleans up a connection that never becomes ready", async () => {
    const { args, browser, trackStop } = setup("openai", false);
    const starting = start(args);
    await vi.advanceTimersByTimeAsync(15000);
    await starting;
    expect(args.setError).toHaveBeenLastCalledWith("Could not start: Realtime connection timed out.");
    expect(browser.sockets[0].readyState).toBe(3);
    expect(trackStop).toHaveBeenCalledOnce();
    expect(vi.getTimerCount()).toBe(0);
  });

  it.each(["openai"] as const)("does not restart %s after stopping during audio setup", async (provider) => {
    let finishLoading!: () => void;
    const audioReady = new Promise<void>((resolve) => { finishLoading = resolve; });
    const { args, browser, trackStop } = setup(provider, true, audioReady);
    const starting = start(args);
    await vi.advanceTimersByTimeAsync(0);
    expect(browser.contexts).toHaveLength(1);

    stop(args.refs, args.setStatus);
    finishLoading();
    await starting;

    expect(browser.processors).toHaveLength(0);
    expect(browser.contexts[0].resume).not.toHaveBeenCalled();
    expect(browser.contexts[0].close).toHaveBeenCalledOnce();
    expect(trackStop).toHaveBeenCalledOnce();
    expect(args.setStatus).toHaveBeenLastCalledWith("idle");
    expect(args.setError).toHaveBeenCalledExactlyOnceWith(null);
    expect(vi.getTimerCount()).toBe(0);
  });


  it("releases a microphone granted after the user stops", async () => {
    const { args, stream, getUserMedia, trackStop, browser } = setup();
    let grant!: (stream: MediaStream) => void;
    getUserMedia.mockReturnValueOnce(new Promise((resolve) => { grant = resolve; }));
    const starting = start(args);
    stop(args.refs, args.setStatus);
    grant(stream);
    await starting;
    expect(trackStop).toHaveBeenCalledOnce();
    expect(browser.fetch).not.toHaveBeenCalled();
    expect(args.setStatus).toHaveBeenLastCalledWith("idle");
    expect(args.refs.mic.current).toBeNull();
  });

  it.each(["openai"] as const)("cancels %s while waiting for setup", async (provider) => {
    const { args, browser } = setup(provider, false);
    const starting = start(args);
    await vi.advanceTimersByTimeAsync(0);
    expect(browser.sockets).toHaveLength(1);
    stop(args.refs, args.setStatus);
    await starting;
    expect(args.setError).toHaveBeenCalledExactlyOnceWith(null);
    expect(args.setStatus).toHaveBeenLastCalledWith("idle");
    expect(browser.sockets[0].readyState).toBe(3);
    expect(browser.contexts).toHaveLength(0);
    expect(vi.getTimerCount()).toBe(0);
  });

  it.each(["openai"] as const)("cleans up when %s rejects connection setup", async (provider) => {
    const { args, browser, trackStop, recorderStop } = setup(provider, false);
    const starting = start(args);
    await vi.advanceTimersByTimeAsync(0);
    browser.sockets[0].emit({ error: { message: "Session rejected" } });
    await starting;

    expect(args.setError).toHaveBeenLastCalledWith("Could not start: Session rejected");
    expect(args.setStatus).toHaveBeenLastCalledWith("idle");
    expect(browser.sockets[0].readyState).toBe(3);
    expect(browser.contexts).toHaveLength(0);
    expect(trackStop).toHaveBeenCalledOnce();
    expect(recorderStop).toHaveBeenCalledOnce();
    expect(vi.getTimerCount()).toBe(0);
  });
});
