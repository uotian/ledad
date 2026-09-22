import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const transcribe = vi.hoisted(() => vi.fn());
const translateMany = vi.hoisted(() => vi.fn());
vi.mock("@/lib/transcribe", () => ({ transcribe }));
vi.mock("@/lib/translate", () => ({ translateMany }));

import { Final, FINAL_INTERVAL_MS } from "@/hooks/use-session/actions/start/final";
import { selectItems } from "@/lib/items";
import type { Item, ItemFinal } from "@/lib/types";

const itemFinal: ItemFinal = {
  id: "final",
  type: "final",
  startedAt: "2026-09-22T00:01:00.000Z",
  endedAt: "2026-09-22T00:02:00.000Z",
  transcripts: ["Accurate transcript."],
  translations: [""],
};

describe("final transcription timeline", () => {
  beforeEach(() => {
    vi.spyOn(console, "log").mockImplementation(() => {});
  });

  it("replaces completed flush items through the latest final end", () => {
    const items: Item[] = [
      { id: "before", type: "flush", startedAt: "2026-09-22T00:00:40.000Z", endedAt: "2026-09-22T00:00:50.000Z", transcripts: ["Before"], translations: [""] },
      { id: "covered", type: "flush", startedAt: "2026-09-22T00:01:10.000Z", endedAt: "2026-09-22T00:01:40.000Z", transcripts: ["Draft"], translations: [""] },
      { id: "crossing", type: "flush", startedAt: "2026-09-22T00:00:50.000Z", endedAt: "2026-09-22T00:01:10.000Z", transcripts: ["Crossing"], translations: [""] },
      { id: "active", type: "flush", startedAt: "2026-09-22T00:01:50.000Z", transcripts: ["Active"], translations: [""] },
    ];

    expect(selectItems([...items, itemFinal])).toEqual([itemFinal, items[3]]);
  });

  it("uses the latest final end regardless of item order", () => {
    const itemFinalBefore: ItemFinal = {
      ...itemFinal,
      id: "final-before",
      startedAt: "2026-09-22T00:00:00.000Z",
      endedAt: itemFinal.startedAt,
    };
    const itemFlush = { id: "crossing", type: "flush" as const, startedAt: "2026-09-22T00:00:50.000Z", endedAt: "2026-09-22T00:01:10.000Z", transcripts: ["Crossing"] as [string], translations: [""] as [string] };

    expect(selectItems([itemFlush, itemFinal, itemFinalBefore])).toEqual([itemFinalBefore, itemFinal]);
  });

  it("records the microphone separately and submits each sixty-second chunk", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-22T00:00:00.000Z"));
    vi.spyOn(crypto, "randomUUID").mockReturnValue("final-id");
    transcribe.mockResolvedValue("Final transcript.");
    let resolveTranslation: (translation: { transcripts: string[]; translations: string[] }) => void = () => {};
    translateMany.mockReturnValue(new Promise((resolve) => { resolveTranslation = resolve; }));
    const lifecycle: string[] = [];
    const recorders: MockMediaRecorder[] = [];
    class MockMediaRecorder {
      static isTypeSupported = vi.fn(() => true);
      state: RecordingState = "inactive";
      mimeType = "audio/webm;codecs=opus";
      listener: ((event: Event) => void) | null = null;
      id = recorders.length;
      constructor(readonly stream: MediaStream) { recorders.push(this); }
      addEventListener(type: string, listener: (event: Event) => void) { if (type === "dataavailable") this.listener = listener; }
      start() {
        this.state = "recording";
        lifecycle.push(`start:${this.id}`);
      }
      stop() {
        this.state = "inactive";
        lifecycle.push(`stop:${this.id}`);
        this.listener?.({ data: new Blob(["audio"], { type: this.mimeType }) } as unknown as Event);
      }
    }
    vi.stubGlobal("MediaRecorder", MockMediaRecorder);
    const mic = {} as MediaStream;
    let items: Item[] = [{ id: "flush", type: "flush", startedAt: "2026-09-22T00:00:10.000Z", endedAt: "2026-09-22T00:00:20.000Z", transcripts: ["Draft"], translations: [""] }];
    const setItems = vi.fn((next: Item[] | ((current: Item[]) => Item[])) => { items = typeof next === "function" ? next(items) : next; });

    const refs: { mic: { current: MediaStream | null }; final: { current: { stop: () => void } | null } } = { mic: { current: mic }, final: { current: null } };
    const final = new Final(
      refs,
      { textSize: "M", langFrom: "en", langTo: "ja", prompt: "Meeting", keywords: [] },
      { from: "en", to: "ja" },
      setItems as never,
      vi.fn() as never,
    );
    refs.final.current = final;
    final.start();
    await vi.advanceTimersByTimeAsync(FINAL_INTERVAL_MS);

    expect(lifecycle).toEqual(["start:0", "start:1", "stop:0"]);
    expect(transcribe).toHaveBeenCalledWith(expect.objectContaining({ audio: expect.any(Blob) }));
    expect(translateMany).toHaveBeenCalledWith({ langFrom: "en", langTo: "ja", text: "Final transcript." });
    expect(items).toEqual([expect.objectContaining({ id: "flush" })]);

    resolveTranslation({ transcripts: ["Final transcript."], translations: ["確定した翻訳。"] });
    await vi.runAllTicks();

    expect(items).toHaveLength(2);
    expect(selectItems(items)).toEqual([expect.objectContaining({ id: "final-id", type: "final", transcripts: ["Final transcript."], translations: ["確定した翻訳。"] })]);
    refs.final.current?.stop();
  });

  it("keeps a submitted final transcript after stopping", async () => {
    vi.useFakeTimers();
    vi.spyOn(crypto, "randomUUID").mockReturnValue("final-id");
    translateMany.mockResolvedValue({ transcripts: ["Final transcript."], translations: ["確定した翻訳。"] });
    let resolveTranscription: (transcript: string) => void = () => {};
    transcribe.mockReturnValue(new Promise<string>((resolve) => { resolveTranscription = resolve; }));
    const recorders: MockMediaRecorder[] = [];
    class MockMediaRecorder {
      static isTypeSupported = vi.fn(() => true);
      state: RecordingState = "inactive";
      mimeType = "audio/webm;codecs=opus";
      listener: ((event: Event) => void) | null = null;
      constructor() { recorders.push(this); }
      addEventListener(type: string, listener: (event: Event) => void) { if (type === "dataavailable") this.listener = listener; }
      start() { this.state = "recording"; }
      stop() {
        this.state = "inactive";
        this.listener?.({ data: new Blob(["audio"], { type: this.mimeType }) } as unknown as Event);
      }
    }
    vi.stubGlobal("MediaRecorder", MockMediaRecorder);
    const items: Item[] = [];
    const refs: { mic: { current: MediaStream | null }; final: { current: { stop: () => void } | null } } = { mic: { current: {} as MediaStream }, final: { current: null } };
    const final = new Final(
      refs,
      { textSize: "M", langFrom: "en", langTo: "ja", prompt: "Meeting", keywords: [] },
      { from: "en", to: "ja" },
      ((next: Item[] | ((current: Item[]) => Item[])) => { items.splice(0, items.length, ...(typeof next === "function" ? next(items) : next)); }) as never,
      vi.fn() as never,
    );
    refs.final.current = final;
    final.start();
    await vi.advanceTimersByTimeAsync(FINAL_INTERVAL_MS);
    refs.final.current?.stop();
    resolveTranscription("Final transcript.");
    await vi.runAllTicks();

    await vi.waitFor(() => expect(items).toEqual([expect.objectContaining({ id: "final-id", type: "final", transcripts: ["Final transcript."], translations: ["確定した翻訳。"] })]));
  });
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});
