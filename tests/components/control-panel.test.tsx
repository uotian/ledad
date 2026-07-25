import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ControlPanel } from "@/components/control-panel";
import type { LangState } from "@/hooks/use-lang";
import type { Session } from "@/hooks/use-session";

function createLang(overrides: Partial<LangState> = {}): LangState {
  return {
    langFrom: "en",
    langTo: "ja",
    setLangFrom: vi.fn(),
    setLangTo: vi.fn(),
    swapLangs: vi.fn(),
    ...overrides,
  };
}

function createSession(overrides: Partial<Session> = {}): Session {
  return {
    items: [],
    error: null,
    status: "idle",
    clear: vi.fn(),
    commit: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
    ...overrides,
  };
}

describe("ControlPanel", () => {
  it("lets an idle user choose and swap languages", async () => {
    const user = userEvent.setup();
    const lang = createLang();

    render(<ControlPanel lang={lang} session={createSession()} />);

    await user.selectOptions(screen.getByLabelText("LangFrom"), "fr");
    await user.selectOptions(screen.getByLabelText("LangTo"), "zh");
    await user.click(screen.getByRole("button", { name: "Swap Langs" }));

    expect(lang.setLangFrom).toHaveBeenCalledWith("fr");
    expect(lang.setLangTo).toHaveBeenCalledWith("zh");
    expect(lang.swapLangs).toHaveBeenCalledOnce();
  });

  it("starts an idle session and disables unavailable actions", async () => {
    const user = userEvent.setup();
    const session = createSession();

    render(<ControlPanel lang={createLang()} session={session} />);

    expect(screen.getByRole("button", { name: "Commit" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Clear" })).toBeDisabled();
    await user.click(screen.getByRole("button", { name: "Start" }));
    expect(session.start).toHaveBeenCalledOnce();
  });

  it("stops or commits a listening session and locks language controls", async () => {
    const user = userEvent.setup();
    const session = createSession({
      status: "listening",
      items: [{ id: "2026-01-01T00:00:00.000Z", transcript: "Hello", translation: "こんにちは" }],
    });

    render(<ControlPanel lang={createLang()} session={session} />);

    expect(screen.getByLabelText("LangFrom")).toBeDisabled();
    expect(screen.getByLabelText("LangTo")).toBeDisabled();
    expect(screen.getByRole("button", { name: "Swap Langs" })).toBeDisabled();
    await user.click(screen.getByRole("button", { name: "Commit" }));
    await user.click(screen.getByRole("button", { name: "Stop" }));
    await user.click(screen.getByRole("button", { name: "Clear" }));
    expect(session.commit).toHaveBeenCalledOnce();
    expect(session.stop).toHaveBeenCalledOnce();
    expect(session.clear).toHaveBeenCalledOnce();
  });

  it("shows a session error next to its status", () => {
    render(<ControlPanel lang={createLang()} session={createSession({ status: "requesting", error: "Microphone denied" })} />);

    expect(screen.getByText("requesting")).toBeInTheDocument();
    expect(screen.getByText("Microphone denied")).toBeInTheDocument();
  });
});
