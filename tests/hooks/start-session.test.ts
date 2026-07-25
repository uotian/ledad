import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Refs } from "@/hooks/use-session/types";

const exchangeSDP = vi.hoisted(() => vi.fn());

vi.mock("@/lib/transcript", () => ({ exchangeSDP }));

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

  return { channel, connection, getUserMedia, listeners, mic, micTrack, senderTrack };
}

function createArgs() {
  const refs: Refs = {
    mic: { current: null },
    connection: { current: null },
    channel: { current: null },
  };
  return {
    refs,
    langs: { from: "en" as const, to: "ja" as const },
    setStatus: vi.fn(),
    setError: vi.fn(),
    setItems: vi.fn(),
    itemLast: { current: { id: "old", transcript: "Old", translation: "" } },
  };
}

describe("session start", () => {
  beforeEach(() => {
    exchangeSDP.mockResolvedValue("answer-sdp");
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("connects microphone audio and enters listening when the data channel opens", async () => {
    const browser = setupBrowserMedia();
    const args = createArgs();

    await start(args);

    expect(args.itemLast.current).toBeNull();
    expect(args.setStatus).toHaveBeenNthCalledWith(1, "requesting");
    expect(args.setStatus).toHaveBeenNthCalledWith(2, "connecting");
    expect(browser.getUserMedia).toHaveBeenCalledWith({ audio: true });
    expect(browser.connection.addTrack).toHaveBeenCalled();
    expect(exchangeSDP).toHaveBeenCalledWith({ langFrom: "en", sdp: "offer-sdp" });
    expect(browser.connection.setRemoteDescription).toHaveBeenCalledWith({ type: "answer", sdp: "answer-sdp" });

    browser.listeners.get("open")?.(new Event("open"));
    expect(args.setStatus).toHaveBeenLastCalledWith("listening");
  });

  it("forwards data-channel errors while the channel is current", async () => {
    const browser = setupBrowserMedia();
    const args = createArgs();
    await start(args);

    browser.listeners.get("error")?.(new Event("error"));

    expect(args.setError).toHaveBeenLastCalledWith("Connection error. Please start again.");
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
    expect(args.refs.channel.current).toBeNull();
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
