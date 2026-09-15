import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SettingsDialog } from "@/components/header/settings";
import { useSettings, settingsKey } from "@/hooks/use-settings";
import { defaultSettings } from "@/lib/settings";

function Settings() {
  const { settings, saveSettings } = useSettings();
  return <SettingsDialog settings={settings} onSave={saveSettings} />;
}

function openSettings() {
  fireEvent.click(screen.getByRole("button", { name: "Settings" }));
}

describe("transcription settings", () => {
  it("uses the current prompts as defaults and restores saved settings after remounting", () => {
    const first = render(<Settings />);
    openSettings();
    expect(screen.getByLabelText("Prompt")).toHaveValue(defaultSettings.prompt);

    fireEvent.change(screen.getByLabelText("Prompt"), { target: { value: "隋の楊堅について。" } });
    fireEvent.change(screen.getByLabelText("Keywords"), { target: { value: "楊堅\n 隋 \n楊堅\n" } });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(JSON.parse(localStorage.getItem(settingsKey)!)).toEqual({ prompt: "隋の楊堅について。", keywords: ["楊堅", "隋"] });

    first.unmount();
    render(<Settings />);
    openSettings();
    expect(screen.getByLabelText("Prompt")).toHaveValue("隋の楊堅について。");
    expect(screen.getByLabelText("Keywords")).toHaveValue("楊堅\n隋");
  });

  it("discards unsaved edits when cancelled", () => {
    render(<Settings />);
    openSettings();
    fireEvent.change(screen.getByLabelText("Prompt"), { target: { value: "Unsaved" } });
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    openSettings();

    expect(screen.getByLabelText("Prompt")).toHaveValue(defaultSettings.prompt);
    expect(localStorage.getItem(settingsKey)).toBeNull();
  });

  it("preserves an intentionally empty prompt instead of restoring defaults", () => {
    localStorage.setItem(settingsKey, JSON.stringify({ prompt: "", keywords: [] }));
    render(<Settings />);
    openSettings();

    expect(screen.getByLabelText("Prompt")).toHaveValue("");
  });

  it("falls back to defaults for unreadable stored data", () => {
    localStorage.setItem(settingsKey, "not json");
    render(<Settings />);
    openSettings();

    expect(screen.getByLabelText("Prompt")).toHaveValue(defaultSettings.prompt);
  });

  it("keeps the dialog open when keywords contain unsupported characters", () => {
    render(<Settings />);
    openSettings();
    fireEvent.change(screen.getByLabelText("Keywords"), { target: { value: "<invalid>" } });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(screen.getByRole("alert")).toHaveTextContent("Keywords cannot contain < or >.");
    expect(localStorage.getItem(settingsKey)).toBeNull();
  });
});
