"use client";

import { SettingsDialog } from "@/components/header/settings";
import { Title } from "@/components/header/title";
import type { Session } from "@/hooks/use-session";

export function Header({ session }: { session: Pick<Session, "status" | "stop"> }) {
  return (
    <header className="flex items-center gap-2 px-1">
      <Title />
      <div className="ml-auto">
        <SettingsDialog session={session} />
      </div>
    </header>
  );
}
