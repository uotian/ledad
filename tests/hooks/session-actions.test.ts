import { describe, expect, it, vi } from "vitest";
import { clear } from "@/hooks/use-session/actions/clear";
import { commit } from "@/hooks/use-session/actions/commit";
import { stop } from "@/hooks/use-session/actions/stop";
import type { ItemLastRef, Refs } from "@/hooks/use-session/types";
import { cleanup } from "@/hooks/use-session/utils";

function createRefs({ readyState = "open", send = vi.fn() }: { readyState?: RTCDataChannelState; send?: ReturnType<typeof vi.fn> } = {}) {
  const channelClose = vi.fn();
  const connectionClose = vi.fn();
  const senderTrackStop = vi.fn();
  const micTrackStop = vi.fn();
  const refs = {
    channel: {
      current: { readyState, send, close: channelClose } as unknown as RTCDataChannel,
    },
    connection: {
      current: {
        getSenders: () => [{ track: { stop: senderTrackStop } }],
        close: connectionClose,
      } as unknown as RTCPeerConnection,
    },
    mic: {
      current: { getTracks: () => [{ stop: micTrackStop }] } as unknown as MediaStream,
    },
  } satisfies Refs;

  return { refs, channelClose, connectionClose, senderTrackStop, micTrackStop, send };
}

describe("session actions", () => {
  it("clears errors, items, and the active transcript", () => {
    const setError = vi.fn();
    const setItems = vi.fn();
    const itemLast = { current: { id: "1", transcript: "Hello", translation: "" } } as ItemLastRef;

    clear(setError, setItems, itemLast);

    expect(setError).toHaveBeenCalledWith(null);
    expect(setItems).toHaveBeenCalledWith([]);
    expect(itemLast.current).toBeNull();
  });

  it("sends a commit event through an open channel", () => {
    const { refs, send } = createRefs();
    const setError = vi.fn();
    vi.spyOn(crypto, "randomUUID").mockReturnValue("event-id");

    expect(commit(refs, setError)).toBe(true);
    expect(setError).toHaveBeenCalledWith(null);
    expect(send).toHaveBeenCalledWith(JSON.stringify({
      event_id: "commit_event-id",
      type: "input_audio_buffer.commit",
    }));
  });

  it("rejects a commit when the channel is not open", () => {
    const { refs, send } = createRefs({ readyState: "closed" });
    const setError = vi.fn();

    expect(commit(refs, setError)).toBe(false);
    expect(send).not.toHaveBeenCalled();
    expect(setError).toHaveBeenCalledWith("Could not commit: the session is not listening.");
  });

  it("reports channel send failures", () => {
    const send = vi.fn(() => {
      throw new Error("channel closed");
    });
    const { refs } = createRefs({ send });
    const setError = vi.fn();

    expect(commit(refs, setError)).toBe(false);
    expect(setError).toHaveBeenLastCalledWith("Could not commit: channel closed");
  });

  it("stops every media resource and clears the refs", () => {
    const { refs, channelClose, connectionClose, senderTrackStop, micTrackStop } = createRefs();

    cleanup(refs);

    expect(channelClose).toHaveBeenCalledOnce();
    expect(connectionClose).toHaveBeenCalledOnce();
    expect(senderTrackStop).toHaveBeenCalledOnce();
    expect(micTrackStop).toHaveBeenCalledOnce();
    expect(refs.channel.current).toBeNull();
    expect(refs.connection.current).toBeNull();
    expect(refs.mic.current).toBeNull();
  });

  it("moves the session to idle after stopping", () => {
    const { refs } = createRefs();
    const setStatus = vi.fn();

    stop(refs, setStatus);

    expect(setStatus).toHaveBeenCalledWith("idle");
    expect(refs.channel.current).toBeNull();
  });
});
