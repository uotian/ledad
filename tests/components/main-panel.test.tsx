import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MainPanel } from "@/components/main-panel";

describe("MainPanel", () => {
  beforeEach(() => {
    Element.prototype.scrollIntoView = vi.fn();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("shows an instruction when the transcript is empty", () => {
    render(<MainPanel items={[]} />);

    expect(screen.getByText("Press ▶ to begin.")).toBeInTheDocument();
  });

  it("renders transcripts and a pending translation state", () => {
    render(<MainPanel items={[{
      id: "2026-01-01T00:00:00.000Z",
      transcript: "Hello",
      translation: "",
    }]} />);

    expect(screen.getByText("Hello")).toBeInTheDocument();
    expect(screen.getByText("...")).toBeInTheDocument();
    expect(Element.prototype.scrollIntoView).toHaveBeenCalled();
  });

  it("renders a completed translation", () => {
    render(<MainPanel items={[{
      id: "2026-01-01T00:00:00.000Z",
      transcript: "Hello",
      translation: "こんにちは",
    }]} />);

    expect(screen.getByText("こんにちは")).toBeInTheDocument();
  });

  it("temporarily pauses auto-scroll after manual scrolling", () => {
    vi.useFakeTimers();
    const { container, rerender } = render(<MainPanel items={[{
      id: "2026-01-01T00:00:00.000Z",
      transcript: "Hello",
      translation: "こんにちは",
    }]} />);
    const initialCalls = vi.mocked(Element.prototype.scrollIntoView).mock.calls.length;

    fireEvent.wheel(container.querySelector("section") as HTMLElement);
    rerender(<MainPanel items={[{
      id: "2026-01-01T00:00:00.000Z",
      transcript: "Hello again",
      translation: "こんにちは",
    }]} />);
    expect(Element.prototype.scrollIntoView).toHaveBeenCalledTimes(initialCalls);

    vi.advanceTimersByTime(10_000);
    rerender(<MainPanel items={[{
      id: "2026-01-01T00:00:00.000Z",
      transcript: "Hello once more",
      translation: "こんにちは",
    }]} />);
    expect(Element.prototype.scrollIntoView).toHaveBeenCalledTimes(initialCalls + 1);
  });
});
