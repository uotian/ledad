import { requestLiveToken } from "@/lib/transcribe";
import type { Settings } from "@/lib/types";
import type { ItemFlushLastRef, Refs, SetItems, SetStatus } from "@/hooks/use-session/types";
import { AudioInput } from "../common/audio";
import { connectSocket } from "../common/socket";
import { Transcript } from "./transcript";

const RECONNECT_INTERVAL_MS = 9 * 60 * 1000;
const GEMINI_WS_URL = "wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContentConstrained";

type LiveMessage = {
  error?: { message?: string };
  setupComplete?: object;
  serverContent?: {
    interimInputTranscription?: { text?: string };
    inputTranscription?: { text?: string };
  };
};

export class Flush {
  private socket: WebSocket | null = null;
  private controller = new AbortController();
  private audio: AudioInput;
  private transcript: Transcript;
  private timer: ReturnType<typeof setTimeout> | null = null;

  constructor(private refs: Pick<Refs, "mic" | "flush">, private settings: Settings, itemFlushLast: ItemFlushLastRef, private setStatus: SetStatus, private onError: (message: string) => void, setItems: SetItems) {
    this.audio = new AudioInput((audio) => {
      if (this.socket?.readyState === WebSocket.OPEN) {
        try {
          // Stop instead of building up seconds of stale audio on a stalled connection.
          if (this.socket.bufferedAmount > 256 * 1024) throw new Error("Audio upload is falling behind. Please start again.");
          this.socket.send(JSON.stringify({ realtimeInput: { audio: { data: audio, mimeType: "audio/pcm;rate=24000" } } }));
        } catch (error) {
          this.stop(error instanceof Error ? error.message : "Could not send audio.");
        }
      }
    });
    this.transcript = new Transcript(itemFlushLast, settings, setItems);
  }

  async start() {
    this.setStatus("connecting");
    await this.connect();
    this.controller.signal.throwIfAborted();
    await this.audio.start(this.refs.mic.current!);
    this.controller.signal.throwIfAborted();
    if (this.refs.flush.current === this) this.setStatus("listening");
  }

  stop(message?: string) {
    if (!this.controller.signal.aborted) {
      if (this.timer) clearTimeout(this.timer);
      this.timer = null;
      this.transcript.stop();
      this.audio.stop();
      this.controller.abort();
      this.socket = null;
      if (message !== undefined) this.onError(message);
    }
  }

  private async connect() {
    this.controller.signal.throwIfAborted();
    const token = await requestLiveToken(this.settings, this.controller.signal);
    const socket = await connectSocket<LiveMessage>({
      url: `${GEMINI_WS_URL}?access_token=${encodeURIComponent(token)}`,
      signal: this.controller.signal,
      setup: { setup: {
        model: "models/gemini-3.5-transcribe-live",
        generationConfig: { responseModalities: ["TEXT"] },
        inputAudioTranscription: {
          languageCodes: [{ en: "en-US", ja: "ja-JP", zh: "cmn-Hans-CN", fr: "fr-FR" }[this.settings.langFrom]],
          customVocabulary: this.settings.keywords.slice(0, 1000),
        },
      } },
      isReady: (message) => Boolean(message.setupComplete),
      getSocket: () => this.socket,
      onMessage: (message) => {
        const content = message.serverContent;
        if (content?.interimInputTranscription?.text) this.transcript.replace(content.interimInputTranscription.text);
        if (content?.inputTranscription?.text) {
          this.transcript.replace(content.inputTranscription.text);
          this.transcript.endSentence();
        }
      },
      onError: (message) => this.stop(message),
    });
    this.controller.signal.throwIfAborted();
    const previous = this.socket;
    if (previous) this.transcript.endSentence();
    this.socket = socket;
    previous?.close();
    this.timer = setTimeout(async () => {
      try {
        await this.connect();
      } catch (error) {
        this.stop(error instanceof Error ? error.message : String(error));
      }
    }, RECONNECT_INTERVAL_MS);
  }
}
