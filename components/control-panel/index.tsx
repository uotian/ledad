"use client";

import type { LangState } from "@/hooks/use-lang";
import type { Session } from "@/hooks/use-session";
import { SessionActions } from "@/components/control-panel/session-actions";
import { SessionActivity } from "@/components/control-panel/session-activity";
import { LangSwitch } from "@/components/control-panel/lang-switch";

export function ControlPanel({ lang, session }: { lang: LangState; session: Session }) {
  return (
    <aside className="sticky bottom-4 z-10 p-3 rounded-xl bg-black/75 shadow-xl backdrop-blur-xl">
      <div className="px-3 flex items-center justify-between gap-4">
        <SessionActivity session={session} />
        <LangSwitch lang={lang} session={session} />
        <SessionActions session={session} />
      </div>
    </aside>
  );
}
