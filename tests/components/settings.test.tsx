import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SettingsDialog } from "@/components/header/settings";
import { settingsKey } from "@/hooks/use-settings";
import { defaultSettings } from "@/lib/settings";

function Settings() {
  return <SettingsDialog session={{ status: "idle", stop: () => undefined }} />;
}

function openSettings() {
  fireEvent.click(screen.getByRole("button", { name: "Settings" }));
}

describe("settings", () => {
  it("uses the current prompts as defaults and restores saved settings after remounting", () => {
    const first = render(<Settings />);
    openSettings();
    expect(screen.getByLabelText("Prompt")).toHaveValue(defaultSettings.prompt);

    fireEvent.change(screen.getByLabelText("Prompt"), { target: { value: "隋の楊堅について。" } });
    fireEvent.change(screen.getByLabelText("Keywords"), { target: { value: "楊堅\n 隋 \n楊堅\n" } });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(JSON.parse(localStorage.getItem(settingsKey)!)).toEqual({ textSize: "M", langFrom: "en", langTo: "ja", prompt: "隋の楊堅について。", keywords: ["楊堅", "隋"] });

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

  it("keeps the dialog open when source and translation languages are the same", () => {
    render(<Settings />);
    openSettings();
    fireEvent.change(screen.getByLabelText("Source language"), { target: { value: "ja" } });
    expect(screen.getByLabelText("Translation language")).toHaveValue("ja");
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(screen.getByRole("alert")).toHaveTextContent("Source and translation languages must be different.");
    expect(localStorage.getItem(settingsKey)).toBeNull();
  });

  it("selects languages independently and restores both after saving", () => {
    const first = render(<Settings />);
    openSettings();
    fireEvent.change(screen.getByLabelText("Source language"), { target: { value: "ja" } });
    expect(screen.getByLabelText("Translation language")).toHaveValue("ja");
    fireEvent.change(screen.getByLabelText("Translation language"), { target: { value: "fr" } });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    first.unmount();
    render(<Settings />);
    openSettings();
    expect(screen.getByLabelText("Source language")).toHaveValue("ja");
    expect(screen.getByLabelText("Translation language")).toHaveValue("fr");
  });

  it("saves the text size and restores it when reopened", () => {
    const first = render(<Settings />);
    openSettings();
    expect(screen.getByLabelText("Text size")).toHaveValue("M");
    fireEvent.change(screen.getByLabelText("Text size"), { target: { value: "L" } });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(JSON.parse(localStorage.getItem(settingsKey)!)).toMatchObject({ textSize: "L" });
    first.unmount();
    render(<Settings />);
    openSettings();
    expect(screen.getByLabelText("Text size")).toHaveValue("L");
  });

});
