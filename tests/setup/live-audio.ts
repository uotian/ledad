import { vi } from "vitest";

export function setupLiveBrowser({ autoReady = true, audioReady = Promise.resolve() } = {}) {
  const sockets: FakeSocket[] = [];
  const contexts: FakeAudioContext[] = [];
  const processors: FakeProcessor[] = [];
  class FakeSocket extends EventTarget {
    static OPEN = 1;
    readyState = 0;
    bufferedAmount = 0;
    binaryType = "blob";
    constructor(readonly url: string, readonly protocols?: string[]) {
      super();
      sockets.push(this);
      queueMicrotask(() => {
        if (this.readyState !== 0) return;
        this.readyState = 1;
        this.dispatchEvent(new Event("open"));
        if (autoReady && url.includes("openai.com")) this.emit({ type: "session.created" });
      });
    }
    send = vi.fn<(data: string) => void>();
    close = vi.fn(() => {
      if (this.readyState === 3) return;
      this.readyState = 3;
      this.dispatchEvent(new Event("close"));
    });
    emit(data: object) { this.dispatchEvent(new MessageEvent("message", { data: JSON.stringify(data) })); }
  }
  class FakeAudioContext {
    sampleRate: number;
    destination = {};
    audioWorklet = { addModule: vi.fn().mockReturnValue(audioReady) };
    source = { connect: vi.fn(), disconnect: vi.fn() };
    constructor(options: AudioContextOptions = {}) {
      this.sampleRate = options.sampleRate ?? 48000;
      contexts.push(this);
    }
    createMediaStreamSource = vi.fn(() => this.source);
    resume = vi.fn().mockResolvedValue(undefined);
    close = vi.fn().mockResolvedValue(undefined);
  }
  class FakeProcessor {
    port: { onmessage: ((event: MessageEvent<ArrayBuffer>) => void) | null } = { onmessage: null };
    constructor() { processors.push(this); }
    connect = vi.fn();
    disconnect = vi.fn();
  }
  vi.stubGlobal("WebSocket", FakeSocket);
  vi.stubGlobal("AudioContext", FakeAudioContext);
  vi.stubGlobal("AudioWorkletNode", FakeProcessor);
  const fetch = vi.fn().mockImplementation(() => Promise.resolve(Response.json({ token: "ephemeral-token" })));
  vi.stubGlobal("fetch", fetch);
  return {
    sockets, contexts, processors, fetch,
    emitAudio(buffer = new ArrayBuffer((contexts.at(-1)?.sampleRate ?? 24000) / 10 * 2)) {
      processors.at(-1)?.port.onmessage?.(new MessageEvent("message", { data: buffer }));
    },
  };
}
