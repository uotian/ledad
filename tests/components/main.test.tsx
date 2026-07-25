import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({
  lang: {
    langFrom: "fr" as const,
    langTo: "zh" as const,
    setLangFrom: vi.fn(),
    setLangTo: vi.fn(),
    swapLangs: vi.fn(),
  },
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

vi.mock("@/hooks/use-lang", () => ({ useLang: () => state.lang }));
vi.mock("@/hooks/use-session", () => ({
  useSession: (...args: unknown[]) => {
    state.useSession(...args);
    return state.session;
  },
}));

import { Main } from "@/components/main";

describe("Main", () => {
  it("wires language state into the session and renders the application shell", () => {
    render(<Main />);

    expect(state.useSession).toHaveBeenCalledWith("fr", "zh");
    expect(screen.getByRole("heading", { name: "ledad" })).toBeInTheDocument();
    expect(screen.getByText("v0.2.1")).toBeInTheDocument();
    expect(screen.getByText("Press ▶ to begin.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Start" })).toBeEnabled();
  });
});
