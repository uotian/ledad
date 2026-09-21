import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({
  session: {
    items: [],
    error: null,
    status: "idle" as import("@/lib/types").Status,
    clear: vi.fn(),
    commit: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
  },
  useSession: vi.fn(),
}));

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
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it.each(["idle", "requesting", "connecting"] as const)("opens settings without confirming or stopping while %s", (status) => {
    state.session.status = status;
    const confirm = vi.spyOn(window, "confirm");
    render(<Main />);
    fireEvent.click(screen.getByRole("button", { name: "Settings" }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(confirm).not.toHaveBeenCalled();
    expect(state.session.stop).not.toHaveBeenCalled();
  });

  it("keeps listening and settings closed when confirmation is cancelled", () => {
    state.session.status = "listening";
    const confirm = vi.spyOn(window, "confirm").mockReturnValue(false);
    render(<Main />);
    fireEvent.click(screen.getByRole("button", { name: "Settings" }));
    expect(confirm).toHaveBeenCalledOnce();
    expect(state.session.stop).not.toHaveBeenCalled();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it.each(["Cancel", "Save"])("stops after confirmation and stays stopped after %s", (action) => {
    state.session.status = "listening";
    const confirm = vi.spyOn(window, "confirm").mockReturnValue(true);
    render(<Main />);
    fireEvent.click(screen.getByRole("button", { name: "Settings" }));
    expect(confirm).toHaveBeenCalledWith("Stop the current session and open settings?");
    expect(state.session.stop).toHaveBeenCalledOnce();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: action }));
    expect(state.session.stop).toHaveBeenCalledOnce();
    expect(state.session.start).not.toHaveBeenCalled();
  });

  it("wires language state into the session and renders the application shell", () => {
    render(<Main />);

    expect(state.useSession).toHaveBeenCalledWith(defaultSettings);
    expect(screen.getByRole("button", { name: "Settings" })).toBeEnabled();
    expect(screen.getByRole("heading", { name: "ledad" })).toBeInTheDocument();
    expect(screen.getByText("v0.3.0")).toBeInTheDocument();
    expect(screen.getByText("Press ▶ to begin.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Start" })).toBeEnabled();
  });
});
