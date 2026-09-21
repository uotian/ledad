import { afterEach, describe, expect, it, vi } from "vitest";
import { requestSDP } from "@/lib/transcribe/live";

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
});
