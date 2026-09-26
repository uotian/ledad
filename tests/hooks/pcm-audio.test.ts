import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import { expect, it } from "vitest";

it("encodes continuous 24000 Hz audio into 100 ms PCM chunks", () => {
  const sampleRate = 24000;
  const chunks: ArrayBuffer[] = [];
  let Processor!: new () => { process: (inputs: Float32Array[][], outputs: Float32Array[][]) => boolean };
  runInNewContext(readFileSync("public/pcm-audio-processor.js", "utf8"), {
    sampleRate,
    AudioWorkletProcessor: class { port = { postMessage: (buffer: ArrayBuffer) => chunks.push(buffer) }; },
    registerProcessor: (_name: string, implementation: typeof Processor) => { Processor = implementation; },
  });
  const processor = new Processor();
  const samples = new Float32Array(sampleRate / 5).fill(0.5);
  samples.set([-2, -1, 0, 1, 2]);
  const output = new Float32Array(128).fill(1);
  for (let offset = 0; offset < samples.length; offset += 128) {
    expect(processor.process([[samples.subarray(offset, offset + 128)]], [[output]])).toBe(true);
    expect(chunks).toHaveLength(Math.floor(Math.min(offset + 128, samples.length) / (sampleRate / 10)));
  }
  expect(chunks.map((chunk) => chunk.byteLength)).toEqual([sampleRate / 5, sampleRate / 5]);
  const view = new DataView(chunks[0]);
  expect(Array.from({ length: 6 }, (_, index) => view.getInt16(index * 2, true))).toEqual([-32768, -32768, 0, 32767, 32767, 16383]);
  expect([...output]).toEqual(Array(128).fill(0));
});
