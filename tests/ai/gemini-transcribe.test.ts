import { afterEach, describe, expect, it, vi } from "vitest";
import { defaultSettings } from "@/lib/settings";
import { createGeminiLiveToken } from "@/ai/gemini/transcribe-live";
import { transcribeGemini } from "@/ai/gemini/transcribe";

afterEach(() => vi.unstubAllGlobals());

describe("Gemini transcription", () => {
  it("creates a model-constrained live token with language and vocabulary hints", async () => {
    const fetchMock = vi.fn().mockResolvedValue(Response.json({ name: "auth_tokens/example" }));
    vi.stubGlobal("fetch", fetchMock);
    const settings = { ...defaultSettings, provider: "gemini" as const, keywords: ["Kubernetes"] };

    await expect(createGeminiLiveToken("secret", settings)).resolves.toBe("auth_tokens/example");

    const [url, options] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://generativelanguage.googleapis.com/v1beta/auth_tokens");
    const body = JSON.parse(options.body as string);
    expect(body).not.toHaveProperty("liveConnectConstraints");
    expect(body.bidiGenerateContentSetup).toEqual({
      model: "models/gemini-3.5-transcribe-live",
      generationConfig: { responseModalities: ["TEXT"] },
      inputAudioTranscription: { languageCodes: ["en-US"], customVocabulary: ["Kubernetes"] },
    });
  });

  it("uploads recorded audio, transcribes it, and deletes the temporary file", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(null, { headers: { "x-goog-upload-url": "https://generativelanguage.googleapis.com/upload/session" } }))
      .mockResolvedValueOnce(Response.json({ file: { name: "files/example", uri: "https://generativelanguage.googleapis.com/files/example" } }))
      .mockResolvedValueOnce(Response.json({ steps: [{ type: "model_output", content: [{ type: "text", text: "A final transcript." }] }] }))
      .mockResolvedValueOnce(new Response(null, { status: 204 }));
    vi.stubGlobal("fetch", fetchMock);
    const audio = new File(["audio"], "transcript.webm", { type: "audio/webm" });

    await expect(transcribeGemini("secret", audio, { ...defaultSettings, provider: "gemini" })).resolves.toBe("A final transcript.");
    expect(fetchMock).toHaveBeenCalledTimes(4);
    expect((fetchMock.mock.calls[2][0] as string)).toBe("https://generativelanguage.googleapis.com/v1beta/interactions");
    expect(JSON.parse((fetchMock.mock.calls[2][1] as RequestInit).body as string).generation_config.transcription_config.language_codes).toEqual(["en-US"]);
    expect(fetchMock.mock.calls[3][0]).toBe("https://generativelanguage.googleapis.com/v1beta/files/example");
  });
});
