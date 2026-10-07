"use client";

import { ControlPanel } from "@/components/control-panel";
import { Header } from "@/components/header";
import { MainPanel } from "@/components/main-panel";
import { useSession } from "@/hooks/use-session";
import { useInsights } from "@/hooks/use-insights";
import { useSettings } from "@/hooks/use-settings";

export function Main() {
  const { settings } = useSettings();
  const session = useSession(settings);
  const insights = useInsights(session.items, session.status === "listening", settings);

  return (
    <main className="h-dvh w-full px-4 py-2 flex flex-col">
      <Header session={session} />
      <MainPanel className="flex-1 min-h-0 mb-3" session={session} settings={settings} insights={insights} />
      <ControlPanel session={session} settings={settings} />
    </main>
  );
}
