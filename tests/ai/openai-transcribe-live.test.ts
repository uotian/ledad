import { afterEach, describe, expect, it, vi } from "vitest";
import { createOpenAILiveToken } from "@/ai/openai/transcribe-live";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("OpenAI live token", () => {
  it("builds the OpenAI transcription session request", async () => {
    const fetchMock = vi.fn().mockResolvedValue(Response.json({ value: "ephemeral-token" }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(createOpenAILiveToken("secret", { provider: "openai" as const, textSize: "M" as const, langFrom: "zh", langTo: "ja", langInsight: "ja", prompt: "中国史の解説です。", keywords: ["楊堅", "隋"] })).resolves.toBe("ephemeral-token");

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    const { session, expires_after } = JSON.parse(init.body as string);
    expect(url).toBe("https://api.openai.com/v1/realtime/client_secrets");
    expect(init.method).toBe("POST");
    expect(init.headers).toEqual({ Authorization: "Bearer secret", "Content-Type": "application/json" });
    expect(expires_after).toEqual({ anchor: "created_at", seconds: 60 });
    expect(session).toMatchObject({
      type: "transcription",
      audio: {
        input: {
          format: { type: "audio/pcm", rate: 24000 },
          transcription: {
            model: "gpt-live-transcribe",
            languages: ["zh"],
            delay: "xhigh",
            prompt: "中国史の解説です。",
            keywords: ["ドパがき", "笑笑"],
          },
          turn_detection: null,
        },
      },
    });
  });

  it("reports upstream failures without exposing the response body", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("invalid offer", { status: 400 })));

    await expect(createOpenAILiveToken("secret", { provider: "openai" as const, textSize: "M" as const, langFrom: "en", langTo: "ja", langInsight: "ja", prompt: "", keywords: [] })).rejects.toThrow("OpenAI token request failed (400).");
  });

  it("reports upstream failures when the body is empty", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("", { status: 500 })));

    await expect(createOpenAILiveToken("secret", { provider: "openai" as const, textSize: "M" as const, langFrom: "en", langTo: "ja", langInsight: "ja", prompt: "", keywords: [] })).rejects.toThrow("OpenAI token request failed (500).");
  });
});
