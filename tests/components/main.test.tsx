import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({
  session: {
    items: [],
    error: null,
    status: "idle" as const,
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
