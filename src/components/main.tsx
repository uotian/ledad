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
    <main className="mx-auto h-dvh w-full max-w-7xl py-2 px-3 sm:px-6 lg:px-12 flex flex-col">
      <Header session={session} />
      <MainPanel className="flex-1 min-h-0 mb-3" session={session} settings={settings} insights={insights} />
      <ControlPanel session={session} settings={settings} />
    </main>
  );
}
