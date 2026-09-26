import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MainPanel } from "@/components/main-panel";
import { defaultSettings } from "@/lib/settings";
import type { Session } from "@/hooks/use-session";
import type { Insights } from "@/hooks/use-insights";

const onClear = vi.fn();
const insights: Insights = { data: null, error: null, updating: false, canRefresh: false, refresh: vi.fn() };

function createSession(items: Session["items"]): Session {
  return { items, error: null, status: "idle", clear: onClear, start: vi.fn(), stop: vi.fn() };
}

describe("MainPanel", () => {
  beforeEach(() => {
    Element.prototype.scrollIntoView = vi.fn();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("shows an instruction when the transcript is empty", () => {
    render(<MainPanel settings={defaultSettings} insights={insights} session={createSession([])} />);

    expect(screen.getByText("Press ▶ to begin.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Clear" })).toBeDisabled();
  });

  it("applies text size from settings and reflects changes", () => {
    const session = createSession([]);
    const { container, rerender } = render(<MainPanel settings={{ ...defaultSettings, textSize: "S" }} insights={insights} session={session} />);
    expect(container.firstElementChild).toHaveClass("text-xs");
    rerender(<MainPanel settings={{ ...defaultSettings, textSize: "L" }} insights={insights} session={session} />);
    expect(container.firstElementChild).toHaveClass("text-lg");
    expect(container.firstElementChild).not.toHaveClass("text-xs");
  });

  it("renders transcripts and a pending translation state", () => {
    render(<MainPanel settings={defaultSettings} insights={insights} session={createSession([{
      id: "2026-01-01T00:00:00.000Z",
      startedAt: "2026-01-01T00:00:00.000Z",
      transcripts: ["Hello"],
      translations: [""],
      type: "flush",
    }])} />);

    expect(screen.getByText("Hello")).toBeInTheDocument();
    expect(screen.getByText("速報")).toBeInTheDocument();
    expect(screen.getByText(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/)).toBeInTheDocument();
    expect(screen.getByText("...")).toBeInTheDocument();
    expect(Element.prototype.scrollIntoView).toHaveBeenCalled();
  });

  it("labels final transcripts in the same timeline", () => {
    render(<MainPanel settings={defaultSettings} insights={insights} session={createSession([{
      id: "final-id",
      startedAt: "2026-01-01T00:00:00.000Z",
      endedAt: "2026-01-01T00:01:00.000Z",
      transcripts: ["Final transcript"],
      translations: ["確定した翻訳"],
      type: "final",
    }])} />);

    expect(screen.getByText("確定版")).toBeInTheDocument();
  });

  it("preserves final transcript and translation line breaks", () => {
    render(<MainPanel settings={defaultSettings} insights={insights} session={createSession([{
      id: "final-id",
      startedAt: "2026-01-01T00:00:00.000Z",
      endedAt: "2026-01-01T00:01:00.000Z",
      transcripts: ["Hello.", "How are you?"],
      translations: ["こんにちは。", "お元気ですか？"],
      type: "final",
    }])} />);

    const paragraphs = screen.getByRole("article").querySelectorAll("p");
    expect([...paragraphs].map((paragraph) => paragraph.textContent)).toEqual([
      "Hello.",
      "こんにちは。",
      "How are you?",
      "お元気ですか？",
    ]);
  });

  it("hides completed flush items covered by a final transcript", () => {
    render(<MainPanel settings={defaultSettings} insights={insights} session={createSession([
      { id: "flush", startedAt: "2026-01-01T00:00:10.000Z", endedAt: "2026-01-01T00:00:20.000Z", transcripts: ["Draft transcript"], translations: ["速報翻訳"], type: "flush" },
      { id: "final", startedAt: "2026-01-01T00:00:00.000Z", endedAt: "2026-01-01T00:01:00.000Z", transcripts: ["Final transcript"], translations: ["確定翻訳"], type: "final" },
    ])} />);

    expect(screen.queryByText("Draft transcript")).not.toBeInTheDocument();
    expect(screen.getByText("Final transcript")).toBeInTheDocument();
  });

  it("renders a completed translation", () => {
    render(<MainPanel settings={defaultSettings} insights={insights} session={createSession([{
      id: "2026-01-01T00:00:00.000Z",
      startedAt: "2026-01-01T00:00:00.000Z",
      transcripts: ["Hello"],
      translations: ["こんにちは"],
      type: "flush",
    }])} />);

    expect(screen.getByText("こんにちは")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Clear" }));
    expect(onClear).toHaveBeenCalledOnce();
  });

  it("temporarily pauses auto-scroll after manual scrolling", () => {
    vi.useFakeTimers();
    const { rerender } = render(<MainPanel settings={defaultSettings} insights={insights} session={createSession([{
      id: "2026-01-01T00:00:00.000Z",
      startedAt: "2026-01-01T00:00:00.000Z",
      transcripts: ["Hello"],
      translations: ["こんにちは"],
      type: "flush",
    }])} />);
    const initialCalls = vi.mocked(Element.prototype.scrollIntoView).mock.calls.length;

    fireEvent.wheel(screen.getByRole("region", { name: "Transcript and translation" }));
    rerender(<MainPanel settings={defaultSettings} insights={insights} session={createSession([{
      id: "2026-01-01T00:00:00.000Z",
      startedAt: "2026-01-01T00:00:00.000Z",
      transcripts: ["Hello again"],
      translations: ["こんにちは"],
      type: "flush",
    }])} />);
    expect(Element.prototype.scrollIntoView).toHaveBeenCalledTimes(initialCalls);

    vi.advanceTimersByTime(10_000);
    rerender(<MainPanel settings={defaultSettings} insights={insights} session={createSession([{
      id: "2026-01-01T00:00:00.000Z",
      startedAt: "2026-01-01T00:00:00.000Z",
      transcripts: ["Hello once more"],
      translations: ["こんにちは"],
      type: "flush",
    }])} />);
    expect(Element.prototype.scrollIntoView).toHaveBeenCalledTimes(initialCalls + 1);
  });
});
