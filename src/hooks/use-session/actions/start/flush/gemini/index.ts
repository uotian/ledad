import { requestLiveToken } from "@/lib/transcribe";
import type { Settings } from "@/lib/types";
import type { ItemFlushLastRef, Refs, SetItems, SetStatus } from "@/hooks/use-session/types";
import { AudioInput } from "../common/audio";
import { connectSocket } from "../common/socket";
import { Transcript } from "./transcript";

const RECONNECT_INTERVAL_MS = 9 * 60 * 1000;
const MAX_UTTERANCE_MS = 15 * 1000;
const GEMINI_WS_URL = "wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContentConstrained";

type LiveMessage = {
  error?: { message?: string };
  setupComplete?: object;
  voiceActivity?: { type?: string; voiceActivityType?: string };
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
  private commitTimer: ReturnType<typeof setTimeout> | null = null;
  private awaitingCommit = false;
  private hasActivityEvents = false;

  constructor(private refs: Pick<Refs, "mic" | "flush">, private settings: Settings, itemFlushLast: ItemFlushLastRef, private setStatus: SetStatus, private onError: (message: string) => void, setItems: SetItems, private onBoundary: (endedAt: string) => void = () => {}) {
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
      this.clearCommitTimer();
      this.awaitingCommit = false;
      this.transcript.stop();
      this.audio.stop();
      this.controller.abort();
      this.socket = null;
      if (message !== undefined) this.onError(message);
    }
  }

  private clearCommitTimer() {
    if (this.commitTimer) clearTimeout(this.commitTimer);
    this.commitTimer = null;
  }

  private scheduleCommit() {
    if (this.commitTimer || this.awaitingCommit) return;
    this.commitTimer = setTimeout(() => {
      this.commitTimer = null;
      if (this.socket?.readyState === WebSocket.OPEN) {
        try {
          this.socket.send(JSON.stringify({ realtimeInput: { audioStreamEnd: true } }));
          this.awaitingCommit = true;
        } catch (error) {
          this.stop(`Could not commit: ${error instanceof Error ? error.message : String(error)}`);
        }
      }
    }, MAX_UTTERANCE_MS);
  }

  private endSentence() {
    // With VAD events, a late transcript must not reset the next utterance's deadline.
    if (!this.hasActivityEvents) {
      this.clearCommitTimer();
      this.awaitingCommit = false;
    }
    const endedAt = new Date().toISOString();
    this.transcript.endSentence(endedAt);
    this.onBoundary(endedAt);
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
          mode: "VERBATIM",
        },
        realtimeInputConfig: { automaticActivityDetection: {
          disabled: false,
          startOfSpeechSensitivity: "START_SENSITIVITY_HIGH",
          endOfSpeechSensitivity: "END_SENSITIVITY_HIGH",
          silenceDurationMs: 100,
        } },
      } },
      isReady: (message) => Boolean(message.setupComplete),
      getSocket: () => this.socket,
      onMessage: (message) => {
        const activity = message.voiceActivity?.type ?? message.voiceActivity?.voiceActivityType;
        if (activity === "ACTIVITY_START" || activity === "ACTIVITY_END") this.hasActivityEvents = true;
        if (activity === "ACTIVITY_START") this.scheduleCommit();
        if (activity === "ACTIVITY_END") {
          this.clearCommitTimer();
          this.awaitingCommit = false;
        }
        const content = message.serverContent;
        console.log(content)
        if (content?.interimInputTranscription?.text) {
          // Fall back to the first interim when no activity-start event is available.
          if (!this.hasActivityEvents) this.scheduleCommit();
          this.transcript.replace(content.interimInputTranscription.text);
        }
        if (content?.inputTranscription) {
          if (content.inputTranscription.text) this.transcript.replace(content.inputTranscription.text);
          this.endSentence();
        }
      },
      onError: (message) => this.stop(message),
    });
    this.controller.signal.throwIfAborted();
    const previous = this.socket;
    this.clearCommitTimer();
    this.awaitingCommit = false;
    this.hasActivityEvents = false;
    if (previous) this.endSentence();
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
