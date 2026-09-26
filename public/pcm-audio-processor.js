class PCMAudioProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.chunkSize = sampleRate / 10; // 100 ms of mono audio.
    this.buffer = new ArrayBuffer(this.chunkSize * 2);
    this.view = new DataView(this.buffer);
    this.offset = 0;
  }

  process(inputs, outputs) {
    const channel = inputs[0]?.[0];
    if (channel) {
      for (const value of channel) {
        const sample = Math.max(-1, Math.min(1, value));
        this.view.setInt16(this.offset * 2, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
        if (++this.offset === this.chunkSize) {
          this.port.postMessage(this.buffer, [this.buffer]);
          this.buffer = new ArrayBuffer(this.chunkSize * 2);
          this.view = new DataView(this.buffer);
          this.offset = 0;
        }
      }
    }
    for (const output of outputs) for (const channel of output) channel.fill(0);
    return true;
  }
}

registerProcessor("pcm-audio-processor", PCMAudioProcessor);
