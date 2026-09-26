import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({
  session: {
    items: [] as import("@/lib/types").Item[],
    error: null,
    status: "idle" as import("@/lib/types").Status,
    clear: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
  },
  useSession: vi.fn(),
  generateInsights: vi.fn(),
}));

vi.mock("@/lib/insights", async (original) => ({ ...await original<typeof import("@/lib/insights")>(), generateInsights: state.generateInsights }));

vi.mock("@/hooks/use-session", () => ({
  useSession: (...args: unknown[]) => {
    state.useSession(...args);
    return state.session;
  },
}));
vi.mock("next/font/google", () => ({ Outfit: () => ({ className: "outfit" }) }));

import { Main } from "@/components/main";
import { defaultSettings } from "@/lib/settings";

describe("Main", () => {
  beforeEach(() => {
    state.session.status = "idle";
    state.session.items = [];
    Element.prototype.scrollIntoView = vi.fn();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("runs Insights independently in langInsight and keeps them after transcript Clear", async () => {
    vi.useFakeTimers();
    state.session.status = "listening";
    const item = { id: "one", type: "flush" as const, startedAt: "2026-09-22T00:00:00.000Z", transcripts: ["The release is Friday."], translations: [""] };
    state.session.items = [item];
    state.generateInsights.mockResolvedValue({ allTopics: [{ title: "Release schedule", summary: "Friday release." }], currentTopic: null });
    state.session.clear.mockImplementation(() => { state.session.items = []; });
    const { rerender } = render(<Main />);
    await act(async () => { await vi.advanceTimersByTimeAsync(60_000); });
    expect(state.generateInsights).toHaveBeenCalledWith({ lang: defaultSettings.langInsight, items: [item] }, expect.any(AbortSignal));
    expect(screen.getByText("Release schedule")).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Clear" }));
    rerender(<Main />);
    expect(state.session.clear).toHaveBeenCalledOnce();
    expect(screen.queryByText("The release is Friday.")).not.toBeInTheDocument();
    expect(screen.getByText("Release schedule")).toBeVisible();
    expect(screen.getByRole("button", { name: "Clear" })).toBeDisabled();
    await act(async () => { await vi.advanceTimersByTimeAsync(60_000); });
    expect(state.generateInsights).toHaveBeenCalledTimes(1);

    state.session.status = "idle";
    state.session.items = [{ ...item, id: "late" }];
    rerender(<Main />);
    await act(async () => { await vi.advanceTimersByTimeAsync(60_000); });
    expect(state.generateInsights).toHaveBeenCalledTimes(1);
  });

  it("opens settings without confirming or stopping while idle", () => {
    const confirm = vi.spyOn(window, "confirm");
    render(<Main />);
    fireEvent.click(screen.getByRole("button", { name: "Settings" }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(confirm).not.toHaveBeenCalled();
    expect(state.session.stop).not.toHaveBeenCalled();
  });

  it.each(["requesting", "connecting", "listening"] as const)("keeps %s and settings closed when confirmation is cancelled", (status) => {
    state.session.status = status;
    const confirm = vi.spyOn(window, "confirm").mockReturnValue(false);
    render(<Main />);
    fireEvent.click(screen.getByRole("button", { name: "Settings" }));
    expect(confirm).toHaveBeenCalledOnce();
    expect(state.session.stop).not.toHaveBeenCalled();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it.each(["requesting", "connecting", "listening"] as const)("stops %s after confirmation", (status) => {
    state.session.status = status;
    const confirm = vi.spyOn(window, "confirm").mockReturnValue(true);
    render(<Main />);
    fireEvent.click(screen.getByRole("button", { name: "Settings" }));
    expect(confirm).toHaveBeenCalledWith("Stop the current session and open settings?");
    expect(state.session.stop).toHaveBeenCalledOnce();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it.each(["Cancel", "Save"])("stays stopped after %s", (action) => {
    state.session.status = "listening";
    vi.spyOn(window, "confirm").mockReturnValue(true);
    render(<Main />);
    fireEvent.click(screen.getByRole("button", { name: "Settings" }));
    fireEvent.click(screen.getByRole("button", { name: action }));
    expect(state.session.stop).toHaveBeenCalledOnce();
    expect(state.session.start).not.toHaveBeenCalled();
  });

  it("wires language state into the session and renders the application shell", () => {
    render(<Main />);

    expect(state.useSession).toHaveBeenCalledWith(defaultSettings);
    expect(screen.getByRole("button", { name: "Settings" })).toBeEnabled();
    expect(screen.getByRole("heading", { name: "ledad" })).toBeInTheDocument();
    expect(screen.getByText("v0.5.1")).toBeInTheDocument();
    expect(screen.getByText("Press ▶ to begin.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Start" })).toBeEnabled();
  });
});
