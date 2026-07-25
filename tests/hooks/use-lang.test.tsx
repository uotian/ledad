import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useLang } from "@/hooks/use-lang";
import { keys } from "@/lib/local-storage";

describe("useLang", () => {
  it("starts with the English to Japanese defaults", () => {
    const { result } = renderHook(() => useLang());

    expect(result.current.langFrom).toBe("en");
    expect(result.current.langTo).toBe("ja");
  });

  it("persists source language changes", () => {
    const { result } = renderHook(() => useLang());

    act(() => result.current.setLangFrom("fr"));

    expect(result.current.langFrom).toBe("fr");
    expect(result.current.langTo).toBe("ja");
    expect(localStorage.getItem(keys.from)).toBe("fr");
  });

  it("moves the previous source language to the target when duplicates would occur", () => {
    const { result } = renderHook(() => useLang());

    act(() => result.current.setLangFrom("ja"));

    expect(result.current.langFrom).toBe("ja");
    expect(result.current.langTo).toBe("en");
  });

  it("moves the previous target language to the source when duplicates would occur", () => {
    const { result } = renderHook(() => useLang());

    act(() => result.current.setLangTo("en"));

    expect(result.current.langFrom).toBe("ja");
    expect(result.current.langTo).toBe("en");
  });

  it("swaps both languages", () => {
    const { result } = renderHook(() => useLang());

    act(() => result.current.swapLangs());

    expect(result.current.langFrom).toBe("ja");
    expect(result.current.langTo).toBe("en");
  });
});
