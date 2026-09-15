"use client";

import type { Session } from "@/hooks/use-session";
import { SessionActions } from "@/components/control-panel/session-actions";
import { SessionActivity } from "@/components/control-panel/session-activity";

export function ControlPanel({ session }: { session: Session }) {
  return (
    <aside className="sticky bottom-4 z-10 p-3 rounded-xl bg-black/75 shadow-xl backdrop-blur-xl">
      <div className="px-3 flex items-center justify-between gap-4">
        <SessionActivity session={session} />
        <SessionActions session={session} />
      </div>
    </aside>
  );
}
