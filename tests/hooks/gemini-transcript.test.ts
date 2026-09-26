import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Transcript } from "@/hooks/use-session/actions/start/flush/gemini/transcript";
import type { ItemFlushLastRef, SetItems } from "@/hooks/use-session/types";
import { defaultSettings } from "@/lib/settings";
import { translate } from "@/lib/translate";
import type { Item } from "@/lib/types";

vi.mock("@/lib/translate", () => ({ translate: vi.fn() }));
const translateMock = vi.mocked(translate);

function setup() {
  let items: Item[] = [];
  const last: ItemFlushLastRef = { current: null };
  const setItems: SetItems = (update) => { items = typeof update === "function" ? update(items) : update; };
  const transcript = new Transcript(last, { ...defaultSettings, provider: "gemini" }, setItems);
  return { transcript, last, items: () => items };
}

beforeEach(() => {
  vi.useFakeTimers();
  translateMock.mockReset().mockResolvedValue("途中の翻訳");
});
afterEach(() => vi.useRealTimers());

describe("Gemini interim translation", () => {
  it("translates the latest interim text during continuous updates without waiting for final text", async () => {
    const { transcript, items } = setup();
    for (const text of ["We", "We are", "We are checking", "We are checking translations"]) {
      transcript.replace(text);
      await vi.advanceTimersByTimeAsync(250);
    }
    expect(translateMock).toHaveBeenCalledExactlyOnceWith({ text: "We are checking translations", settings: { ...defaultSettings, provider: "gemini" } });
    expect(items()[0]).toMatchObject({ translations: ["途中の翻訳"] });
    expect(items()[0]).not.toHaveProperty("endedAt");
    transcript.replace("We are checking translations");
    await vi.advanceTimersByTimeAsync(2000);
    expect(translateMock).toHaveBeenCalledOnce();
    transcript.replace("We are checking translations now");
    await vi.advanceTimersByTimeAsync(1000);
    expect(translateMock).toHaveBeenCalledTimes(2);
    expect(translateMock).toHaveBeenLastCalledWith(expect.objectContaining({ text: "We are checking translations now" }));
    expect(items()).toHaveLength(1);
  });

  it("translates final text immediately and cancels the scheduled interim request", async () => {
    const { transcript, last, items } = setup();
    transcript.replace("Hello");
    await vi.advanceTimersByTimeAsync(500);
    transcript.replace("Hello world.");
    transcript.endSentence();
    expect(translateMock).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({ text: "Hello world." }));
    await vi.advanceTimersByTimeAsync(2000);
    expect(translateMock).toHaveBeenCalledOnce();
    expect(last.current).toBeNull();
    expect(items()[0]).toMatchObject({ endedAt: expect.any(String), translations: ["途中の翻訳"] });
  });

  it("cancels pending translation on stop", async () => {
    const { transcript } = setup();
    transcript.replace("Hello");
    transcript.stop();
    await vi.advanceTimersByTimeAsync(2000);
    expect(translateMock).not.toHaveBeenCalled();
  });

  it("shows a completed interim translation while a newer request is pending", async () => {
    const { transcript, items } = setup();
    let resolveFirst!: (value: string) => void;
    let resolveSecond!: (value: string) => void;
    translateMock.mockReturnValueOnce(new Promise((resolve) => { resolveFirst = resolve; }))
      .mockReturnValueOnce(new Promise((resolve) => { resolveSecond = resolve; }));
    transcript.replace("Hello");
    await vi.advanceTimersByTimeAsync(1000);
    transcript.replace("Hello world");
    await vi.advanceTimersByTimeAsync(1000);
    resolveFirst("こんにちは");
    await vi.advanceTimersByTimeAsync(0);
    expect(items()[0].translations).toEqual(["こんにちは"]);
    resolveSecond("世界の皆さん、こんにちは");
    await vi.advanceTimersByTimeAsync(0);
    expect(items()[0].translations).toEqual(["世界の皆さん、こんにちは"]);
  });

  it("does not let a late interim response overwrite the final translation or the next sentence", async () => {
    const { transcript, last, items } = setup();
    let resolveInterim!: (value: string) => void;
    translateMock.mockReturnValueOnce(new Promise((resolve) => { resolveInterim = resolve; }))
      .mockResolvedValueOnce("確定した翻訳");
    transcript.replace("Hello");
    await vi.advanceTimersByTimeAsync(1000);
    transcript.replace("Hello world.");
    transcript.endSentence();
    await vi.advanceTimersByTimeAsync(0);
    transcript.replace("Next sentence");
    resolveInterim("古い翻訳");
    await vi.advanceTimersByTimeAsync(0);
    expect(items()[0].translations).toEqual(["確定した翻訳"]);
    expect(last.current?.transcripts).toEqual(["Next sentence"]);
    expect(last.current?.translations).toEqual([""]);
    transcript.stop();
  });
});
