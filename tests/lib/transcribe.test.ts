import { afterEach, describe, expect, it, vi } from "vitest";
import { requestSDP, transcribe } from "@/lib/transcribe";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("browser transcript client", () => {
  it("posts SDP with the selected source language", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response("answer-sdp", { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    const settings = { textSize: "M" as const, langFrom: "fr" as const, langTo: "ja" as const, prompt: "A history lecture.", keywords: ["Egypt"] };
    await expect(requestSDP({ sdp: "offer-sdp", settings })).resolves.toBe("answer-sdp");
    expect(fetchMock).toHaveBeenCalledWith("/api/transcribe/live", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sdp: "offer-sdp", settings }),
    });
  });

  it("throws the API error when SDP exchange fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json({ error: "upstream failed" }, { status: 502 })));

    await expect(requestSDP({ sdp: "offer", settings: { textSize: "M" as const, langFrom: "en", langTo: "ja", prompt: "", keywords: [] } })).rejects.toThrow("upstream failed");
  });

  it("uploads recorded audio for a final transcription", async () => {
    const fetchMock = vi.fn().mockResolvedValue(Response.json({ transcript: "Final transcript." }));
    vi.stubGlobal("fetch", fetchMock);
    const audio = new Blob(["audio"], { type: "audio/webm" });
    const settings = { textSize: "M" as const, langFrom: "en" as const, langTo: "ja" as const, prompt: "A meeting.", keywords: [] };

    await expect(transcribe({ audio, filename: "transcript.webm", settings })).resolves.toBe("Final transcript.");

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("/api/transcribe");
    expect(init.method).toBe("POST");
    expect(init.body).toBeInstanceOf(FormData);
    expect((init.body as FormData).get("audio")).toEqual(expect.objectContaining({ name: "transcript.webm", type: "audio/webm" }));
  });

});
