import { afterEach, describe, expect, it, vi } from "vitest";
import { translate } from "@/lib/translate";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("browser translation client", () => {
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
  ])("returns a stable fallback for an unusable response", async (response) => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(response));

    await expect(translate({ langFrom: "ja", langTo: "en", text: "テスト" })).resolves.toBe("Translation failed.");
  });

  it("returns a stable fallback for a network error", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));

    await expect(translate({ langFrom: "ja", langTo: "en", text: "テスト" })).resolves.toBe("Translation failed.");
  });
});
