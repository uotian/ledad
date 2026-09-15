"use client";

import { SettingsDialog } from "@/components/header/settings";
import { Title } from "@/components/header/title";
import { useSettings } from "@/hooks/use-settings";

export function Header() {
  const { settings, saveSettings } = useSettings();

  return (
    <header className="flex items-center gap-2 px-1">
      <Title />
      <div className="ml-auto">
        <SettingsDialog settings={settings} onSave={saveSettings} />
      </div>
    </header>
  );
}
