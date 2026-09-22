"use client";

import type { Session } from "@/hooks/use-session";
import type { Settings } from "@/lib/types";
import { SessionActions } from "@/components/control-panel/session-actions";
import { SessionActivity } from "@/components/control-panel/session-activity";

export function ControlPanel({ session, settings }: { session: Session; settings: Settings }) {
  return (
    <aside className="sticky bottom-0 z-10 p-3 rounded-xl bg-black/75 shadow-xl backdrop-blur-xl">
      <div className="px-3 grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-4">
        <SessionActivity session={session} />
        <span className="whitespace-nowrap text-sm text-white/60">{settings.langFrom} → {settings.langTo}</span>
        <SessionActions session={session} className="justify-self-end" />
      </div>
    </aside>
  );
}
