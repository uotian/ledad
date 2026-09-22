import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Refs } from "@/hooks/use-session/types";

const requestSDP = vi.hoisted(() => vi.fn());

vi.mock("@/lib/transcribe", () => ({ requestSDP }));

import { start } from "@/hooks/use-session/actions/start";

type Listener = (event: Event) => void;

function setupBrowserMedia(offer: RTCSessionDescriptionInit = { type: "offer", sdp: "offer-sdp" }) {
  const listeners = new Map<string, Listener>();
  const micTrack = { stop: vi.fn() };
  const senderTrack = { stop: vi.fn() };
  const mic = {
    getAudioTracks: vi.fn(() => [micTrack]),
    getTracks: vi.fn(() => [micTrack]),
  } as unknown as MediaStream;
  const channel = {
    addEventListener: vi.fn((type: string, listener: Listener) => listeners.set(type, listener)),
    close: vi.fn(),
  } as unknown as RTCDataChannel;
  const connection = {
    addTrack: vi.fn(),
    createDataChannel: vi.fn(() => channel),
    createOffer: vi.fn().mockResolvedValue(offer),
    setLocalDescription: vi.fn().mockResolvedValue(undefined),
    setRemoteDescription: vi.fn().mockResolvedValue(undefined),
    getSenders: vi.fn(() => [{ track: senderTrack }]),
    close: vi.fn(),
  } as unknown as RTCPeerConnection;
  const getUserMedia = vi.fn().mockResolvedValue(mic);

  vi.stubGlobal("navigator", { mediaDevices: { getUserMedia } });
  vi.stubGlobal("RTCPeerConnection", function MockRTCPeerConnection() {
    return connection;
  });
  vi.stubGlobal("MediaRecorder", class MockMediaRecorder {
    static isTypeSupported() { return true; }
    state: RecordingState = "inactive";
    addEventListener() {}
    start() { this.state = "recording"; }
    requestData() {}
    stop() { this.state = "inactive"; }
  });

  return { channel, connection, getUserMedia, listeners, mic, micTrack, senderTrack };
}

function createArgs() {
  const refs: Refs = {
    mic: { current: null },
    flush: { current: null },
    final: { current: null },
  };
  return {
    refs,
    settings: { textSize: "M" as const, langFrom: "en" as const, langTo: "ja" as const, prompt: "An international meeting.", keywords: ["GSP"] },
    setStatus: vi.fn(),
    setError: vi.fn(),
    setItems: vi.fn(),
    itemFlushLast: { current: { id: "old", startedAt: "2026-01-01T00:00:00.000Z", transcripts: ["Old"] as [string], translations: [""] as [string], type: "flush" as const } },
  };
}

describe("session start", () => {
  beforeEach(() => {
    requestSDP.mockResolvedValue("answer-sdp");
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("connects microphone audio and enters listening when the data channel opens", async () => {
    const browser = setupBrowserMedia();
    const args = createArgs();

    await start(args);

    expect(args.itemFlushLast.current).toBeNull();
    expect(args.setStatus).toHaveBeenNthCalledWith(1, "requesting");
    expect(args.setStatus).toHaveBeenNthCalledWith(2, "connecting");
    expect(browser.getUserMedia).toHaveBeenCalledWith({ audio: true });
    expect(browser.connection.addTrack).toHaveBeenCalled();
    expect(requestSDP).toHaveBeenCalledWith({ sdp: "offer-sdp", settings: args.settings });
    expect(browser.connection.setRemoteDescription).toHaveBeenCalledWith({ type: "answer", sdp: "answer-sdp" });

    browser.listeners.get("open")?.(new Event("open"));
    expect(args.setStatus).toHaveBeenLastCalledWith("listening");
    args.refs.final.current?.stop();
  });

  it("forwards data-channel errors while the channel is current", async () => {
    const browser = setupBrowserMedia();
    const args = createArgs();
    await start(args);

    browser.listeners.get("error")?.(new Event("error"));

    expect(args.setError).toHaveBeenLastCalledWith("Connection error. Please start again.");
    args.refs.final.current?.stop();
  });

  it("returns to idle and cleans up when an offer has no SDP", async () => {
    const browser = setupBrowserMedia({ type: "offer" });
    const args = createArgs();

    await start(args);

    expect(args.setStatus).toHaveBeenLastCalledWith("idle");
    expect(args.setError).toHaveBeenLastCalledWith("Could not start: Could not create SDP for Realtime connection.");
    expect(browser.channel.close).toHaveBeenCalledOnce();
    expect(browser.connection.close).toHaveBeenCalledOnce();
    expect(browser.micTrack.stop).toHaveBeenCalled();
    expect(args.refs.flush.current).toBeNull();
  });

  it("reports microphone permission failures", async () => {
    const browser = setupBrowserMedia();
    browser.getUserMedia.mockRejectedValue(new Error("Permission denied"));
    const args = createArgs();

    await start(args);

    expect(args.setStatus).toHaveBeenLastCalledWith("idle");
    expect(args.setError).toHaveBeenLastCalledWith("Could not start: Permission denied");
  });
});
