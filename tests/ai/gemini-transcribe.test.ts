// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";
import { defaultSettings } from "@/lib/settings";
import { createGeminiLiveToken } from "@/ai/gemini/transcribe-live";
import { transcribeGemini } from "@/ai/gemini/transcribe";

afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

describe("Gemini transcription", () => {
  it("creates a model-constrained live token with language and vocabulary hints", async () => {
    const now = Date.now();
    vi.spyOn(Date, "now").mockReturnValue(now);
    vi.stubEnv("GOOGLE_GENAI_API_VERSION", "v1");
    vi.stubEnv("GOOGLE_GENAI_USE_VERTEXAI", "true");
    vi.stubEnv("GOOGLE_GEMINI_BASE_URL", "https://example.test");
    const fetchMock = vi.fn().mockResolvedValue(Response.json({ name: "auth_tokens/example" }));
    vi.stubGlobal("fetch", fetchMock);
    const settings = { ...defaultSettings, provider: "gemini" as const, keywords: ["Kubernetes"] };

    await expect(createGeminiLiveToken("secret", settings)).resolves.toBe("auth_tokens/example");

    const request = new Request(...fetchMock.mock.calls[0] as [RequestInfo, RequestInit?]);
    expect(request.url).toBe("https://generativelanguage.googleapis.com/v1beta/auth_tokens");
    expect(request.headers.get("x-goog-api-key")).toBe("secret");
    expect(request.headers.get("x-goog-api-client")).toContain("google-genai-sdk/3.");
    const body = await request.json();
    expect(body.uses).toBe(1);
    expect(body.expireTime).toBe(new Date(now + 11 * 60 * 1000).toISOString());
    expect(body.newSessionExpireTime).toBe(new Date(now + 60 * 1000).toISOString());
    expect(body).not.toHaveProperty("liveConnectConstraints");
    expect(body).not.toHaveProperty("fieldMask");
    expect(body.bidiGenerateContentSetup).toEqual({
      model: "models/gemini-3.5-transcribe-live",
      generationConfig: { responseModalities: ["TEXT"] },
      inputAudioTranscription: { languageCodes: ["en-US"], customVocabulary: ["Kubernetes"], mode: "VERBATIM" },
      realtimeInputConfig: { automaticActivityDetection: {
        disabled: false,
        startOfSpeechSensitivity: "START_SENSITIVITY_HIGH",
        endOfSpeechSensitivity: "END_SENSITIVITY_HIGH",
        silenceDurationMs: 100,
      } },
    });
  });

  it("uploads recorded audio, transcribes it, and deletes the temporary file", async () => {
    vi.stubEnv("GOOGLE_GENAI_API_VERSION", "v1");
    vi.stubEnv("GOOGLE_GENAI_USE_VERTEXAI", "true");
    vi.stubEnv("GOOGLE_GEMINI_BASE_URL", "https://example.test");
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(null, { headers: { "x-goog-upload-url": "https://generativelanguage.googleapis.com/upload/session" } }))
      .mockResolvedValueOnce(Response.json({ file: { name: "files/example", uri: "https://generativelanguage.googleapis.com/files/example" } }))
      .mockResolvedValueOnce(Response.json({ status: "completed", steps: [{ type: "model_output", content: [{ type: "text", text: "A final transcript." }] }] }))
      .mockResolvedValueOnce(new Response(null, { status: 204 }));
    vi.stubGlobal("fetch", fetchMock);
    const audio = new File(["audio"], "transcript.webm", { type: "audio/webm" });

    await expect(transcribeGemini("secret", audio, { ...defaultSettings, provider: "gemini", keywords: ["Kubernetes"] })).resolves.toBe("A final transcript.");
    expect(fetchMock).toHaveBeenCalledTimes(4);
    expect(fetchMock.mock.calls[0][0]).toBe("https://generativelanguage.googleapis.com/upload/v1/files");
    const request = new Request(...fetchMock.mock.calls[2] as [RequestInfo, RequestInit?]);
    expect(request.url).toBe("https://generativelanguage.googleapis.com/v1beta/interactions");
    expect(request.headers.get("x-goog-api-key")).toBe("secret");
    expect(request.headers.get("x-goog-api-client")).toContain("google-genai-sdk/3.");
    const body = await request.json();
    expect(body).toMatchObject({ model: "gemini-3.5-transcribe", input: [{ type: "audio", uri: "https://generativelanguage.googleapis.com/files/example", mime_type: "audio/webm" }] });
    const config = body.generation_config.transcription_config;
    expect(config.language_codes).toEqual(["en-US"]);
    expect(config.mode).toEqual({ type: "verbatim" });
    expect(config.custom_vocabulary).toEqual(["Kubernetes"]);
    expect(fetchMock.mock.calls[3][0]).toBe("https://generativelanguage.googleapis.com/v1/files/example");
  });

  it.each(["en", "ja", "zh", "fr"] as const)("preserves the %s language and caps the token vocabulary", async (langFrom) => {
    const fetchMock = vi.fn().mockResolvedValue(Response.json({ name: "auth_tokens/example" }));
    vi.stubGlobal("fetch", fetchMock);
    const keywords = Array.from({ length: 1001 }, (_, i) => `term${i}`);
    await createGeminiLiveToken("secret", { ...defaultSettings, langFrom, keywords });
    const request = new Request(...fetchMock.mock.calls[0] as [RequestInfo, RequestInit?]);
    const transcription = (await request.json()).bidiGenerateContentSetup.inputAudioTranscription;
    expect(transcription.languageCodes).toEqual([{ en: "en-US", ja: "ja-JP", zh: "cmn-Hans-CN", fr: "fr-FR" }[langFrom]]);
    expect(transcription.customVocabulary).toEqual(keywords.slice(0, 1000));
  });

  it("sanitizes token errors without retrying token creation", async () => {
    const fetchMock = vi.fn().mockImplementation(() => Promise.resolve(Response.json({ error: { message: "private token details" } }, { status: 503 })));
    vi.stubGlobal("fetch", fetchMock);
    await expect(createGeminiLiveToken("secret", defaultSettings)).rejects.toThrow("Gemini token request failed (503).");
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it("rejects a missing token", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json({})));
    await expect(createGeminiLiveToken("secret", defaultSettings)).rejects.toThrow("did not return a live token");
  });

  it.each(["http://generativelanguage.googleapis.com/upload/session", "https://example.test/upload", "https://googleapis.com.example.test/upload"])("does not upload audio to an untrusted URL: %s", async (url) => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { headers: { "x-goog-upload-url": url } }));
    vi.stubGlobal("fetch", fetchMock);
    await expect(transcribeGemini("secret", new File(["audio"], "transcript.webm", { type: "audio/webm" }), defaultSettings)).rejects.toThrow("secure upload URL");
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it.each(["upstream", "incomplete", "network"])("deletes recorded audio after a %s failure", async (failure) => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(null, { headers: { "x-goog-upload-url": "https://generativelanguage.googleapis.com/upload/session" } }))
      .mockResolvedValueOnce(Response.json({ file: { name: "files/example", uri: "https://generativelanguage.googleapis.com/files/example" } }));
    if (failure === "network") fetchMock.mockRejectedValueOnce(new Error("private connection details"));
    else fetchMock.mockResolvedValueOnce(failure === "upstream"
      ? Response.json({ error: { message: "private response details" } }, { status: 400 })
      : Response.json({ status: "incomplete", steps: [{ type: "model_output", content: [{ type: "text", text: "partial" }] }] }));
    fetchMock.mockRejectedValueOnce(new Error("deletion offline"));
    vi.stubGlobal("fetch", fetchMock);

    const expected = failure === "upstream" ? "Gemini transcription failed (400)."
      : failure === "incomplete" ? "Gemini transcription was incomplete." : "Gemini transcription failed.";
    await expect(transcribeGemini("secret", new File(["audio"], "transcript.m4a", { type: "audio/mp4;codecs=mp4a.40.2" }), defaultSettings)).rejects.toThrow(expected);
    expect(fetchMock).toHaveBeenCalledTimes(4);
    const upload = new Request(...fetchMock.mock.calls[0] as [RequestInfo, RequestInit?]);
    expect(upload.headers.get("x-goog-upload-header-content-type")).toBe("audio/m4a");
    const deletion = new Request(...fetchMock.mock.calls[3] as [RequestInfo, RequestInit?]);
    expect(deletion.url).toBe("https://generativelanguage.googleapis.com/v1/files/example");
    expect(deletion.method).toBe("DELETE");
    expect(deletion.headers.get("x-goog-api-key")).toBe("secret");
  });
});
