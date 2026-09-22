import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { translate, translateMany } from "@/lib/translate";

beforeEach(() => {
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("browser translation client", () => {
  it.each(["", " \n "])("does not request a translation for blank text", async (text) => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    await expect(translate({ langFrom: "ja", langTo: "en", text })).resolves.toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
    expect(console.error).not.toHaveBeenCalled();
  });

  it("posts text with both languages and returns the translation", async () => {
    const fetchMock = vi.fn().mockResolvedValue(Response.json({ translation: "こんにちは" }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(translate({ langFrom: "en", langTo: "ja", text: "Hello" })).resolves.toBe("こんにちは");
    expect(fetchMock).toHaveBeenCalledWith("/api/translate", {
      method: "POST",
      headers: {
        "Content-Type": "text/plain",
        "X-Lang-From": "en",
        "X-Lang-To": "ja",
      },
      body: "Hello",
    });
  });

  it.each([
    Response.json({ error: "bad request" }, { status: 400 }),
    Response.json({}, { status: 200 }),
  ])("returns no translation for an unusable response", async (response) => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(response));

    await expect(translate({ langFrom: "ja", langTo: "en", text: "テスト" })).resolves.toBeNull();
    expect(console.error).toHaveBeenCalled();
  });

  it("returns no translation for a network error", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));

    await expect(translate({ langFrom: "ja", langTo: "en", text: "テスト" })).resolves.toBeNull();
    expect(console.error).toHaveBeenCalled();
  });

  it("uses the multiple translation endpoint for aligned transcript and translation", async () => {
    const result = { transcripts: ["Hello.", "How are you?"], translations: ["こんにちは。", "お元気ですか？"] };
    const fetchMock = vi.fn().mockResolvedValue(Response.json(result));
    vi.stubGlobal("fetch", fetchMock);

    await expect(translateMany({ langFrom: "en", langTo: "ja", text: "Hello. How are you?" })).resolves.toEqual(result);
    expect(fetchMock).toHaveBeenCalledWith("/api/translate/many", {
      method: "POST",
      headers: {
        "Content-Type": "text/plain",
        "X-Lang-From": "en",
        "X-Lang-To": "ja",
      },
      body: "Hello. How are you?",
    });
  });

  it("throws a multiple translation API error", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json({ error: "unaligned" }, { status: 502 })));

    await expect(translateMany({ langFrom: "en", langTo: "ja", text: "Hello." })).rejects.toThrow("unaligned");
  });
});
