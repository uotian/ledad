import { afterEach, describe, expect, it, vi } from "vitest";

const translateMany = vi.hoisted(() => vi.fn());

vi.mock("@/ai/openai/translate-many", () => ({ translateMany }));

import { POST } from "@/app/api/translate/many/route";

afterEach(() => {
  vi.unstubAllEnvs();
});

function request(body = "Hello. How are you?", langFrom = "en", langTo = "ja") {
  return new Request("https://example.test/api/translate/many", {
    method: "POST",
    headers: {
      "X-Lang-From": langFrom,
      "X-Lang-To": langTo,
    },
    body,
  });
}

describe("POST /api/translate/many", () => {
  it("returns aligned final transcript and translation", async () => {
    vi.stubEnv("OPENAI_API_KEY", "secret");
    const result = { transcripts: ["Hello.", "How are you?"], translations: ["こんにちは。", "お元気ですか？"] };
    translateMany.mockResolvedValue(result);

    const response = await POST(request());

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual(result);
    expect(translateMany).toHaveBeenCalledWith("secret", "en", "ja", "Hello. How are you?");
  });

  it("rejects blank text", async () => {
    vi.stubEnv("OPENAI_API_KEY", "secret");

    const response = await POST(request(" \n "));

    expect(response.status).toBe(400);
    expect(translateMany).not.toHaveBeenCalled();
  });

  it("returns final translation failures as a bad gateway", async () => {
    vi.stubEnv("OPENAI_API_KEY", "secret");
    translateMany.mockRejectedValue(new Error("unaligned transcript"));

    const response = await POST(request());

    expect(response.status).toBe(502);
    await expect(response.json()).resolves.toEqual({ error: "unaligned transcript" });
  });
});
