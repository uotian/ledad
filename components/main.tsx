"use client";

import { ControlPanel } from "@/components/control-panel";
import { MainPanel } from "@/components/main-panel";
import { useLang } from "@/hooks/use-lang";
import { useSession } from "@/hooks/use-session";

export function Main() {
  const lang = useLang();
  const session = useSession(lang.langFrom, lang.langTo);

  return (
    <main className="mx-auto h-dvh w-full max-w-7xl py-6 px-12 flex flex-col gap-6">
      <MainPanel className="flex-1 min-h-0 overflow-y-auto" items={session.items} />
      <ControlPanel lang={lang} session={session} />
    </main>
  );
}
