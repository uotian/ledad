import { afterEach, describe, expect, it, vi } from "vitest";
import { requestLiveToken, transcribe } from "@/lib/transcribe";
import { defaultSettings } from "@/lib/settings";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("browser transcript client", () => {
  it("requests a token with the selected settings", async () => {
    const fetchMock = vi.fn().mockResolvedValue(Response.json({ token: "ephemeral-token" }));
    vi.stubGlobal("fetch", fetchMock);

    const settings = { provider: "openai" as const, textSize: "M" as const, langFrom: "fr" as const, langTo: "ja" as const, prompt: "A history lecture.", keywords: ["Egypt"] };
    await expect(requestLiveToken(settings)).resolves.toBe("ephemeral-token");
    expect(fetchMock).toHaveBeenCalledWith("/api/transcribe/openai/live", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ settings }),
      signal: undefined,
    });
  });

  it("throws the API error when token creation fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json({ error: "upstream failed" }, { status: 502 })));

    await expect(requestLiveToken(defaultSettings)).rejects.toThrow("upstream failed");
  });

  it("uploads recorded audio for a final transcription", async () => {
    const fetchMock = vi.fn().mockResolvedValue(Response.json({ transcript: "Final transcript." }));
    vi.stubGlobal("fetch", fetchMock);
    const audio = new Blob(["audio"], { type: "audio/webm" });
    const settings = { provider: "openai" as const, textSize: "M" as const, langFrom: "en" as const, langTo: "ja" as const, prompt: "A meeting.", keywords: [] };

    await expect(transcribe({ audio, filename: "transcript.webm", settings })).resolves.toBe("Final transcript.");

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("/api/transcribe/openai");
    expect(init.method).toBe("POST");
    expect(init.body).toBeInstanceOf(FormData);
    expect((init.body as FormData).get("audio")).toEqual(expect.objectContaining({ name: "transcript.webm", type: "audio/webm" }));
  });


});
