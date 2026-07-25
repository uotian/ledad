import { afterEach, describe, expect, it, vi } from "vitest";
import { exchangeSDP } from "@/ai/realtime/transcript";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("Realtime SDP exchange", () => {
  it("builds the OpenAI transcription session request", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response("answer-sdp", { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(exchangeSDP("secret", "offer-sdp", "zh")).resolves.toBe("answer-sdp");

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    const body = init.body as FormData;
    const session = JSON.parse(String(body.get("session")));
    expect(url).toBe("https://api.openai.com/v1/realtime/calls");
    expect(init.method).toBe("POST");
    expect(init.headers).toEqual({ Authorization: "Bearer secret" });
    expect(body.get("sdp")).toBe("offer-sdp");
    expect(session).toMatchObject({
      type: "transcription",
      audio: {
        input: {
          transcription: {
            model: "gpt-realtime-whisper",
            language: "zh",
          },
        },
      },
    });
  });

  it("surfaces the upstream response body on failure", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("invalid offer", { status: 400 })));

    await expect(exchangeSDP("secret", "offer", "en")).rejects.toThrow("invalid offer");
  });

  it("uses a stable fallback when the upstream error body is empty", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("", { status: 500 })));

    await expect(exchangeSDP("secret", "offer", "en")).rejects.toThrow("Could not connect to Realtime API.");
  });
});
