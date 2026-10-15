import { afterEach, describe, expect, it, vi } from "vitest";
import { translate, translateMany } from "@/lib/translate";
import { defaultSettings } from "@/lib/settings";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("browser translation client", () => {
  it("posts text and its previous translation with both languages", async () => {
    const fetchMock = vi.fn().mockResolvedValue(Response.json({ translation: "こんにちは" }));
    vi.stubGlobal("fetch", fetchMock);

    const previous = "やあ";
    await expect(translate({ settings: { ...defaultSettings, langFrom: "en", langTo: "ja" }, text: "Hello", previous })).resolves.toBe("こんにちは");
    expect(fetchMock).toHaveBeenCalledWith("/api/translate/openai", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Lang-From": "en",
        "X-Lang-To": "ja",
      },
      body: JSON.stringify({ text: "Hello", previous }),
    });
  });

  it.each([
    Response.json({ error: "bad request" }, { status: 400 }),
    Response.json({}, { status: 200 }),
  ])("throws for an unusable response", async (response) => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(response));

    await expect(translate({ settings: { ...defaultSettings, langFrom: "ja", langTo: "en" }, text: "テスト" })).rejects.toThrow();
  });

  it("throws a network error", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));

    await expect(translate({ settings: { ...defaultSettings, langFrom: "ja", langTo: "en" }, text: "テスト" })).rejects.toThrow("offline");
  });

  it("uses the multiple translation endpoint for aligned transcript and translation", async () => {
    const result = { transcripts: ["Hello.", "How are you?"], translations: ["こんにちは。", "お元気ですか？"] };
    const fetchMock = vi.fn().mockResolvedValue(Response.json(result));
    vi.stubGlobal("fetch", fetchMock);

    await expect(translateMany({ settings: { ...defaultSettings, langFrom: "en", langTo: "ja" }, text: "Hello. How are you?" })).resolves.toEqual(result);
    expect(fetchMock).toHaveBeenCalledWith("/api/translate/openai/many", {
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

    await expect(translateMany({ settings: { ...defaultSettings, langFrom: "en", langTo: "ja" }, text: "Hello." })).rejects.toThrow("unaligned");
  });
});

it.each([translate, translateMany])("uses OpenAI even when transcription uses Gemini", async (call) => {
  const fetchMock = vi.fn().mockResolvedValue(Response.json({ translation: "訳", transcripts: ["text"], translations: ["訳"] }));
  vi.stubGlobal("fetch", fetchMock);
  await call({ text: "text", settings: { ...defaultSettings, provider: "gemini" } });
  expect(fetchMock.mock.calls[0][0]).toBe(call === translate ? "/api/translate/openai" : "/api/translate/openai/many");
});
