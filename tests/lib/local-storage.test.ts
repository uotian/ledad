import { describe, expect, it, vi } from "vitest";
import { getLang, keys, setLangs, subscribeLang } from "@/lib/local-storage";

describe("language storage", () => {
  it("returns stored supported languages and ignores invalid values", () => {
    localStorage.setItem(keys.from, "zh");
    localStorage.setItem(keys.to, "de");

    expect(getLang(keys.from, "en")).toBe("zh");
    expect(getLang(keys.to, "ja")).toBe("ja");
  });

  it("stores both languages and notifies same-tab subscribers once", () => {
    const callback = vi.fn();
    const unsubscribe = subscribeLang(callback);

    setLangs("fr", "en");

    expect(localStorage.getItem(keys.from)).toBe("fr");
    expect(localStorage.getItem(keys.to)).toBe("en");
    expect(callback).toHaveBeenCalledOnce();

    unsubscribe();
    setLangs("ja", "zh");
    expect(callback).toHaveBeenCalledOnce();
  });

  it("only reacts to relevant cross-tab storage events", () => {
    const callback = vi.fn();
    const unsubscribe = subscribeLang(callback);

    window.dispatchEvent(new StorageEvent("storage", { key: "unrelated" }));
    window.dispatchEvent(new StorageEvent("storage", { key: keys.to }));

    expect(callback).toHaveBeenCalledOnce();
    unsubscribe();
  });
});
