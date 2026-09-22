"use client";

import { ControlPanel } from "@/components/control-panel";
import { Header } from "@/components/header";
import { MainPanel } from "@/components/main-panel";
import { useSession } from "@/hooks/use-session";
import { useSettings } from "@/hooks/use-settings";

export function Main() {
  const { settings } = useSettings();
  const session = useSession(settings);

  return (
    <main className="mx-auto h-dvh w-full max-w-7xl py-2 px-12 flex flex-col">
      <Header session={session} />
      <MainPanel className="flex-1 min-h-0 mb-3" items={session.items} onClear={session.clear} textSize={settings.textSize} />
      <ControlPanel session={session} settings={settings} />
    </main>
  );
}
