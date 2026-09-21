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
      transcript: "Hello",
      translation: "",
      type: "flush",
    }]} />);

    expect(screen.getByText("Hello")).toBeInTheDocument();
    expect(screen.getByText(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/)).toBeInTheDocument();
    expect(screen.getByText("...")).toBeInTheDocument();
    expect(Element.prototype.scrollIntoView).toHaveBeenCalled();
  });

  it("renders a completed translation", () => {
    render(<MainPanel textSize="M" onClear={onClear} items={[{
      id: "2026-01-01T00:00:00.000Z",
      startedAt: "2026-01-01T00:00:00.000Z",
      transcript: "Hello",
      translation: "こんにちは",
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
      transcript: "Hello",
      translation: "こんにちは",
      type: "flush",
    }]} />);
    const initialCalls = vi.mocked(Element.prototype.scrollIntoView).mock.calls.length;

    fireEvent.wheel(container.querySelector("section") as HTMLElement);
    rerender(<MainPanel textSize="M" onClear={onClear} items={[{
      id: "2026-01-01T00:00:00.000Z",
      startedAt: "2026-01-01T00:00:00.000Z",
      transcript: "Hello again",
      translation: "こんにちは",
      type: "flush",
    }]} />);
    expect(Element.prototype.scrollIntoView).toHaveBeenCalledTimes(initialCalls);

    vi.advanceTimersByTime(10_000);
    rerender(<MainPanel textSize="M" onClear={onClear} items={[{
      id: "2026-01-01T00:00:00.000Z",
      startedAt: "2026-01-01T00:00:00.000Z",
      transcript: "Hello once more",
      translation: "こんにちは",
      type: "flush",
    }]} />);
    expect(Element.prototype.scrollIntoView).toHaveBeenCalledTimes(initialCalls + 1);
  });
});
