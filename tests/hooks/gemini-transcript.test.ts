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
  it("coalesces updates and passes the last displayed translation to the next request", async () => {
    const { transcript, items } = setup();
    let resolveFirst!: (value: string) => void;
    translateMock.mockReturnValueOnce(new Promise((resolve) => { resolveFirst = resolve; }));
    transcript.replace("We plan");
    await vi.advanceTimersByTimeAsync(0);
    for (const text of ["We plan to", "We plan to launch", "We plan to launch tomorrow"]) {
      transcript.replace(text);
      await vi.advanceTimersByTimeAsync(0);
    }
    expect(translateMock).toHaveBeenCalledOnce();
    resolveFirst("私たちは計画しています");
    await vi.advanceTimersByTimeAsync(0);
    expect(translateMock).toHaveBeenCalledTimes(2);
    expect(translateMock).toHaveBeenLastCalledWith(expect.objectContaining({
      text: "We plan to launch tomorrow", previous: "私たちは計画しています",
    }));
    expect(items()[0].translations).toEqual(["途中の翻訳"]);
  });

  it.each(["next utterance", "clear"])("does not carry a previous translation across %s", async (boundary) => {
    const { transcript, last } = setup();
    transcript.replace("First sentence");
    await vi.advanceTimersByTimeAsync(0);
    if (boundary === "clear") last.current = null;
    else transcript.endSentence();
    transcript.replace("New sentence");
    await vi.advanceTimersByTimeAsync(0);
    expect(translateMock.mock.calls.at(-1)?.[0].previous).toBe("");
  });

  it("translates each changed interim text without a batching delay", async () => {
    const { transcript, items } = setup();
    for (const text of ["We", "We are", "We are checking", "We are checking translations"]) {
      transcript.replace(text);
      await vi.advanceTimersByTimeAsync(0);
      expect(translateMock).toHaveBeenLastCalledWith(expect.objectContaining({ text, settings: { ...defaultSettings, provider: "gemini" } }));
    }
    expect(translateMock).toHaveBeenCalledTimes(4);
    expect(items()[0]).toMatchObject({ translations: ["途中の翻訳"] });
    expect(items()[0]).not.toHaveProperty("endedAt");
    transcript.replace("We are checking translations");
    await vi.advanceTimersByTimeAsync(2000);
    expect(translateMock).toHaveBeenCalledTimes(4);
    transcript.replace("We are checking translations now");
    await vi.advanceTimersByTimeAsync(0);
    expect(translateMock).toHaveBeenCalledTimes(5);
    expect(translateMock).toHaveBeenLastCalledWith(expect.objectContaining({ text: "We are checking translations now" }));
    expect(items()).toHaveLength(1);
  });

  it("translates final text immediately and cancels the scheduled interim request", async () => {
    const { transcript, last, items } = setup();
    transcript.replace("Hello");
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
    await vi.advanceTimersByTimeAsync(0);
    transcript.replace("Hello world");
    await vi.advanceTimersByTimeAsync(0);
    resolveFirst("こんにちは");
    await vi.advanceTimersByTimeAsync(0);
    expect(items()[0].translations).toEqual(["こんにちは"]);
    resolveSecond("世界の皆さん、こんにちは");
    await vi.advanceTimersByTimeAsync(0);
    expect(items()[0].translations).toEqual(["世界の皆さん、こんにちは"]);
  });

  it("translates queued final text after the interim result without changing the next utterance", async () => {
    const { transcript, last, items } = setup();
    let resolveInterim!: (value: string) => void;
    translateMock.mockImplementation(({text}) => Promise.resolve(text === "Hello world." ? "確定した翻訳" : "次の翻訳"))
      .mockReturnValueOnce(new Promise((resolve) => { resolveInterim = resolve; }));
    transcript.replace("Hello");
    await vi.advanceTimersByTimeAsync(0);
    transcript.replace("Hello world.");
    transcript.endSentence();
    expect(translateMock).toHaveBeenCalledOnce();
    transcript.replace("Next sentence");
    await vi.advanceTimersByTimeAsync(0);
    resolveInterim("こんにちは");
    await vi.advanceTimersByTimeAsync(0);
    expect(translateMock).toHaveBeenLastCalledWith(expect.objectContaining({text: "Hello world.", previous: "こんにちは"}));
    expect(items()[0].translations).toEqual(["確定した翻訳"]);
    expect(last.current?.transcripts).toEqual(["Next sentence"]);
    expect(last.current?.translations).toEqual(["次の翻訳"]);
  });

  it.each(["stop", "clear"])("drops pending updates after %s", async (boundary) => {
    const { transcript, last } = setup();
    let resolve!: (value: string) => void;
    translateMock.mockReturnValueOnce(new Promise((done) => { resolve = done; }));
    transcript.replace("Hello");
    await vi.advanceTimersByTimeAsync(0);
    transcript.replace("Hello world");
    await vi.advanceTimersByTimeAsync(0);
    if (boundary === "stop") transcript.stop();
    else last.current = null;
    resolve("こんにちは");
    await vi.advanceTimersByTimeAsync(0);
    expect(translateMock).toHaveBeenCalledOnce();
    if (boundary === "stop") expect(last.current?.translations).toEqual([""]);
  });

  it("keeps the previous translation and does not retry unchanged failed text", async () => {
    const { transcript, items } = setup();
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    transcript.replace("Hello");
    await vi.advanceTimersByTimeAsync(0);
    translateMock.mockRejectedValueOnce(new Error("Empty response"));
    transcript.replace("Hello world");
    await vi.advanceTimersByTimeAsync(0);
    expect(items()[0].translations).toEqual(["途中の翻訳"]);
    expect(translateMock).toHaveBeenCalledTimes(2);
    expect(log).toHaveBeenCalledOnce();
    log.mockRestore();
  });
});
