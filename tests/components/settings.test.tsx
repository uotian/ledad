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
  it("defaults to Gemini and hides the OpenAI prompt", () => {
    render(<Settings />);
    openSettings();
    expect(screen.getByLabelText("STT Provider")).toHaveValue("gemini");
    expect(screen.queryByLabelText("Prompt")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(JSON.parse(localStorage.getItem(settingsKey)!)).toMatchObject({ provider: "gemini" });
  });

  it("uses the current prompts as defaults and restores saved settings after remounting", () => {
    const first = render(<Settings />);
    openSettings();
    fireEvent.change(screen.getByLabelText("STT Provider"), { target: { value: "openai" } });
    expect(screen.getByLabelText("Prompt")).toHaveValue(defaultSettings.prompt);

    fireEvent.change(screen.getByLabelText("Prompt"), { target: { value: "隋の楊堅について。" } });
    fireEvent.change(screen.getByLabelText("Keywords"), { target: { value: "楊堅\n 隋 \n楊堅\n" } });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(JSON.parse(localStorage.getItem(settingsKey)!)).toEqual({ provider: "openai" as const, textSize: "M", langFrom: "en", langTo: "ja", langInsight: "ja", prompt: "隋の楊堅について。", keywords: ["楊堅", "隋"] });

    first.unmount();
    render(<Settings />);
    openSettings();
    expect(screen.getByLabelText("Prompt")).toHaveValue("隋の楊堅について。");
    expect(screen.getByLabelText("Keywords")).toHaveValue("楊堅\n隋");
  });

  it("discards unsaved edits when cancelled", () => {
    render(<Settings />);
    openSettings();
    fireEvent.change(screen.getByLabelText("STT Provider"), { target: { value: "openai" } });
    fireEvent.change(screen.getByLabelText("Prompt"), { target: { value: "Unsaved" } });
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    openSettings();

    fireEvent.change(screen.getByLabelText("STT Provider"), { target: { value: "openai" } });
    expect(screen.getByLabelText("Prompt")).toHaveValue(defaultSettings.prompt);
    expect(localStorage.getItem(settingsKey)).toBeNull();
  });

  it("preserves an intentionally empty prompt instead of restoring defaults", () => {
    localStorage.setItem(settingsKey, JSON.stringify({ provider: "openai", prompt: "", keywords: [] }));
    render(<Settings />);
    openSettings();

    expect(screen.getByLabelText("Prompt")).toHaveValue("");
  });

  it("falls back to defaults for unreadable stored data", () => {
    localStorage.setItem(settingsKey, "not json");
    render(<Settings />);
    openSettings();

    fireEvent.change(screen.getByLabelText("STT Provider"), { target: { value: "openai" } });
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
    fireEvent.change(screen.getByLabelText("Speech language"), { target: { value: "ja" } });
    expect(screen.getByLabelText("Translation language")).toHaveValue("ja");
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(screen.getByRole("alert")).toHaveTextContent("Speech and translation languages must be different.");
    expect(localStorage.getItem(settingsKey)).toBeNull();
  });

  it("selects transcription, translation, and Insights languages independently and restores them", () => {
    const first = render(<Settings />);
    openSettings();
    fireEvent.change(screen.getByLabelText("Speech language"), { target: { value: "ja" } });
    expect(screen.getByLabelText("Translation language")).toHaveValue("ja");
    fireEvent.change(screen.getByLabelText("Translation language"), { target: { value: "fr" } });
    expect(screen.getByLabelText("Insights language")).toHaveValue("ja");
    fireEvent.change(screen.getByLabelText("Insights language"), { target: { value: "zh" } });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    first.unmount();
    render(<Settings />);
    openSettings();
    expect(screen.getByLabelText("Speech language")).toHaveValue("ja");
    expect(screen.getByLabelText("Translation language")).toHaveValue("fr");
    expect(screen.getByLabelText("Insights language")).toHaveValue("zh");
  });

  it("defaults older saved settings to Japanese Insights without changing their other values", () => {
    localStorage.setItem(settingsKey, JSON.stringify({ provider: "gemini", langFrom: "ja", langTo: "fr", prompt: "Saved prompt", keywords: ["Ledad"] }));
    render(<Settings />);
    openSettings();
    expect(screen.getByLabelText("STT Provider")).toHaveValue("gemini");
    expect(screen.getByLabelText("Speech language")).toHaveValue("ja");
    expect(screen.getByLabelText("Translation language")).toHaveValue("fr");
    expect(screen.getByLabelText("Insights language")).toHaveValue("ja");
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(JSON.parse(localStorage.getItem(settingsKey)!)).toMatchObject({ langInsight: "ja", langTo: "fr", prompt: "Saved prompt", keywords: ["Ledad"] });
  });

  it("saves the text size and restores it when reopened", () => {
    const first = render(<Settings />);
    openSettings();
    expect(screen.getByLabelText("Text size")).toHaveValue("M");
    fireEvent.change(screen.getByLabelText("Text size"), { target: { value: "L" } });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(JSON.parse(localStorage.getItem(settingsKey)!)).toMatchObject({ provider: "gemini" as const, textSize: "L" });
    first.unmount();
    render(<Settings />);
    openSettings();
    expect(screen.getByLabelText("Text size")).toHaveValue("L");
  });

});
