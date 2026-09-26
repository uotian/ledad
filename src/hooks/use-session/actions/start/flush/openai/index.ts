import { requestLiveToken } from "@/lib/transcribe";
import type { RealtimeEvent, Settings } from "@/lib/types";
import type { ItemFlushLastRef, Refs, SetItems, SetStatus } from "@/hooks/use-session/types";
import { AudioInput } from "../common/audio";
import { connectSocket } from "../common/socket";
import { Transcript } from "./transcript";

const COMMIT_INTERVAL_MS = 15 * 1000;

export class Flush {
  private socket: WebSocket | null = null;
  private controller = new AbortController();
  private audio: AudioInput;
  private transcript: Transcript;
  private pendingAudio = false;
  private timer: ReturnType<typeof setInterval> | null = null;

  constructor(private refs: Pick<Refs, "mic" | "flush">, private settings: Settings, itemFlushLast: ItemFlushLastRef, private setStatus: SetStatus, private onError: (message: string) => void, setItems: SetItems) {
    this.audio = new AudioInput((audio) => {
      if (this.socket?.readyState === WebSocket.OPEN) {
        try {
          // Stop instead of building up seconds of stale audio on a stalled connection.
          if (this.socket.bufferedAmount > 256 * 1024) throw new Error("Audio upload is falling behind. Please start again.");
          this.socket.send(JSON.stringify({ type: "input_audio_buffer.append", audio }));
          this.pendingAudio = true;
        } catch (error) {
          this.stop(error instanceof Error ? error.message : "Could not send audio.");
        }
      }
    });
    this.transcript = new Transcript(itemFlushLast, settings, setItems);
  }

  async start() {
    this.setStatus("connecting");
    this.controller.signal.throwIfAborted();
    const token = await requestLiveToken(this.settings, this.controller.signal);
    this.socket = await connectSocket<RealtimeEvent>({
      url: "wss://api.openai.com/v1/realtime?intent=transcription",
      protocols: ["realtime", `openai-insecure-api-key.${token}`],
      signal: this.controller.signal,
      isReady: (message) => message.type === "session.created",
      getSocket: () => this.socket,
      onMessage: (message) => {
        if (message.type === "conversation.item.input_audio_transcription.delta" && message.delta) {
          this.transcript.append(message.delta);
        }
      },
      onError: (message) => this.stop(message),
    });
    this.controller.signal.throwIfAborted();
    await this.audio.start(this.refs.mic.current!);
    this.controller.signal.throwIfAborted();
    if (this.refs.flush.current === this) {
      this.setStatus("listening");
      this.timer = setInterval(() => {
        if (this.socket?.readyState === WebSocket.OPEN && this.pendingAudio) {
          try {
            this.socket.send(JSON.stringify({ event_id: `commit_${crypto.randomUUID()}`, type: "input_audio_buffer.commit" }));
            this.pendingAudio = false;
            void this.transcript.translate();
          } catch (error) {
            this.stop(`Could not commit: ${error instanceof Error ? error.message : String(error)}`);
          }
        }
      }, COMMIT_INTERVAL_MS);
    }
  }

  stop(message?: string) {
    if (!this.controller.signal.aborted) {
      if (this.timer) clearInterval(this.timer);
      this.timer = null;
      this.audio.stop();
      this.controller.abort();
      this.socket = null;
      this.pendingAudio = false;
      if (message !== undefined) this.onError(message);
    }
  }
}
