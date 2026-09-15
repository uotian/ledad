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
    <main className="mx-auto h-dvh w-full max-w-7xl py-6 px-12 flex flex-col gap-4">
      <Header />
      <MainPanel className="flex-1 min-h-0 overflow-y-auto" items={session.items} />
      <ControlPanel session={session} />
    </main>
  );
}
