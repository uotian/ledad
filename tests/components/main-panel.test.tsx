import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MainPanel } from "@/components/main-panel";

const onClear = vi.fn();

describe("MainPanel", () => {
  beforeEach(() => {
    Element.prototype.scrollIntoView = vi.fn();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("shows an instruction when the transcript is empty", () => {
    render(<MainPanel textSize="M" onClear={onClear} items={[]} />);

    expect(screen.getByText("Press ▶ to begin.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Clear" })).toBeDisabled();
  });

  it("renders transcripts and a pending translation state", () => {
    render(<MainPanel textSize="M" onClear={onClear} items={[{
      id: "2026-01-01T00:00:00.000Z",
      startedAt: "2026-01-01T00:00:00.000Z",
      transcripts: ["Hello"],
      translations: [""],
      type: "flush",
    }]} />);

    expect(screen.getByText("Hello")).toBeInTheDocument();
    expect(screen.getByText("速報")).toBeInTheDocument();
    expect(screen.getByText(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/)).toBeInTheDocument();
    expect(screen.getByText("...")).toBeInTheDocument();
    expect(Element.prototype.scrollIntoView).toHaveBeenCalled();
  });

  it("labels final transcripts in the same timeline", () => {
    render(<MainPanel textSize="M" onClear={onClear} items={[{
      id: "final-id",
      startedAt: "2026-01-01T00:00:00.000Z",
      endedAt: "2026-01-01T00:01:00.000Z",
      transcripts: ["Final transcript"],
      translations: ["確定した翻訳"],
      type: "final",
    }]} />);

    expect(screen.getByText("確定版")).toBeInTheDocument();
  });

  it("preserves final transcript and translation line breaks", () => {
    render(<MainPanel textSize="M" onClear={onClear} items={[{
      id: "final-id",
      startedAt: "2026-01-01T00:00:00.000Z",
      endedAt: "2026-01-01T00:01:00.000Z",
      transcripts: ["Hello.", "How are you?"],
      translations: ["こんにちは。", "お元気ですか？"],
      type: "final",
    }]} />);

    const paragraphs = screen.getByRole("article").querySelectorAll("p");
    expect([...paragraphs].map((paragraph) => paragraph.textContent)).toEqual([
      "Hello.",
      "こんにちは。",
      "How are you?",
      "お元気ですか？",
    ]);
  });

  it("hides completed flush items covered by a final transcript", () => {
    render(<MainPanel textSize="M" onClear={onClear} items={[
      { id: "flush", startedAt: "2026-01-01T00:00:10.000Z", endedAt: "2026-01-01T00:00:20.000Z", transcripts: ["Draft transcript"], translations: ["速報翻訳"], type: "flush" },
      { id: "final", startedAt: "2026-01-01T00:00:00.000Z", endedAt: "2026-01-01T00:01:00.000Z", transcripts: ["Final transcript"], translations: ["確定翻訳"], type: "final" },
    ]} />);

    expect(screen.queryByText("Draft transcript")).not.toBeInTheDocument();
    expect(screen.getByText("Final transcript")).toBeInTheDocument();
  });

  it("renders a completed translation", () => {
    render(<MainPanel textSize="M" onClear={onClear} items={[{
      id: "2026-01-01T00:00:00.000Z",
      startedAt: "2026-01-01T00:00:00.000Z",
      transcripts: ["Hello"],
      translations: ["こんにちは"],
      type: "flush",
    }]} />);

    expect(screen.getByText("こんにちは")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Clear" }));
    expect(onClear).toHaveBeenCalledOnce();
  });

  it("temporarily pauses auto-scroll after manual scrolling", () => {
    vi.useFakeTimers();
    const { container, rerender } = render(<MainPanel textSize="M" onClear={onClear} items={[{
      id: "2026-01-01T00:00:00.000Z",
      startedAt: "2026-01-01T00:00:00.000Z",
      transcripts: ["Hello"],
      translations: ["こんにちは"],
      type: "flush",
    }]} />);
    const initialCalls = vi.mocked(Element.prototype.scrollIntoView).mock.calls.length;

    fireEvent.wheel(container.querySelector("section") as HTMLElement);
    rerender(<MainPanel textSize="M" onClear={onClear} items={[{
      id: "2026-01-01T00:00:00.000Z",
      startedAt: "2026-01-01T00:00:00.000Z",
      transcripts: ["Hello again"],
      translations: ["こんにちは"],
      type: "flush",
    }]} />);
    expect(Element.prototype.scrollIntoView).toHaveBeenCalledTimes(initialCalls);

    vi.advanceTimersByTime(10_000);
    rerender(<MainPanel textSize="M" onClear={onClear} items={[{
      id: "2026-01-01T00:00:00.000Z",
      startedAt: "2026-01-01T00:00:00.000Z",
      transcripts: ["Hello once more"],
      translations: ["こんにちは"],
      type: "flush",
    }]} />);
    expect(Element.prototype.scrollIntoView).toHaveBeenCalledTimes(initialCalls + 1);
  });
});
