export class AudioInput {
  private context: AudioContext | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private processor: AudioWorkletNode | null = null;
  private stopped = false;

  constructor(private onAudio: (audio: string) => void) {}

  async start(stream: MediaStream) {
    // The browser resamples the microphone to 24 kHz for both providers.
    const context = new AudioContext({ sampleRate: 24000 });
    this.context = context;
    await context.audioWorklet.addModule("/pcm-audio-processor.js");
    if (!this.stopped) {
      this.source = context.createMediaStreamSource(stream);
      this.processor = new AudioWorkletNode(context, "pcm-audio-processor", { channelCount: 1, channelCountMode: "explicit" });
      this.processor.port.onmessage = ({ data }: MessageEvent<ArrayBuffer>) => {
        if (!this.stopped) {
          let binary = "";
          for (const byte of new Uint8Array(data)) binary += String.fromCharCode(byte);
          this.onAudio(btoa(binary));
        }
      };
      this.source.connect(this.processor);
      this.processor.connect(context.destination);
      await context.resume();
    }
  }

  stop() {
    this.stopped = true;
    if (this.processor) this.processor.port.onmessage = null;
    this.processor?.disconnect();
    this.source?.disconnect();
    void this.context?.close().catch(() => undefined);
    this.processor = null;
    this.source = null;
    this.context = null;
  }
}
