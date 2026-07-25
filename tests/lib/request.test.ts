import { describe, expect, it } from "vitest";
import { readLang } from "@/lib/request";

describe("readLang", () => {
  it("returns a supported language from the requested header", () => {
    const request = new Request("https://example.test", {
      headers: { "X-Lang": "fr" },
    });

    expect(readLang(request, "X-Lang", "en")).toBe("fr");
  });

  it.each([null, "", "de", "JA"])("falls back for an unsupported value: %s", (value) => {
    const headers = value === null ? undefined : { "X-Lang": value };
    const request = new Request("https://example.test", { headers });

    expect(readLang(request, "X-Lang", "ja")).toBe("ja");
  });
});
