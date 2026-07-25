import { afterEach, describe, expect, it, vi } from "vitest";
import { exchangeSDP } from "@/lib/transcript";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("browser transcript client", () => {
  it("posts SDP with the selected source language", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response("answer-sdp", { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(exchangeSDP({ langFrom: "fr", sdp: "offer-sdp" })).resolves.toBe("answer-sdp");
    expect(fetchMock).toHaveBeenCalledWith("/api/transcript", {
      method: "POST",
      headers: { "Content-Type": "application/sdp", "X-Lang-From": "fr" },
      body: "offer-sdp",
    });
  });

  it("throws the API error when SDP exchange fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json({ error: "upstream failed" }, { status: 502 })));

    await expect(exchangeSDP({ langFrom: "en", sdp: "offer" })).rejects.toThrow("upstream failed");
  });
});
