import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ControlPanel } from "@/components/control-panel";
import type { Session } from "@/hooks/use-session";
import { defaultSettings } from "@/lib/settings";

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
  it("starts an idle session and disables unavailable actions", async () => {
    const user = userEvent.setup();
    const session = createSession();

    render(<ControlPanel session={session} settings={defaultSettings} />);

    expect(screen.getByRole("button", { name: "Commit" })).toBeDisabled();
    expect(screen.queryByRole("button", { name: "Clear" })).not.toBeInTheDocument();
    expect(screen.getByText("en → ja")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Start" }));
    expect(session.start).toHaveBeenCalledOnce();
  });

  it("stops or commits a listening session ", async () => {
    const user = userEvent.setup();
    const session = createSession({
      status: "listening",
      items: [{ id: "2026-01-01T00:00:00.000Z", startedAt: "2026-01-01T00:00:00.000Z", transcripts: ["Hello"], translations: ["こんにちは"], type: "flush" }],
    });

    render(<ControlPanel session={session} settings={defaultSettings} />);

    await user.click(screen.getByRole("button", { name: "Commit" }));
    await user.click(screen.getByRole("button", { name: "Stop" }));
    expect(session.commit).toHaveBeenCalledOnce();
    expect(session.stop).toHaveBeenCalledOnce();
  });

  it("shows a session error next to its status", () => {
    render(<ControlPanel session={createSession({ status: "requesting", error: "Microphone denied" })} settings={defaultSettings} />);

    expect(screen.getByText("requesting")).toBeInTheDocument();
    expect(screen.getByText("Microphone denied")).toBeInTheDocument();
  });
});
