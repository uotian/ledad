import { Eraser, Play, Square } from "lucide-react";
import type { Session } from "@/hooks/use-session";
import { Button } from "@/components/control-panel/session-actions/button";
import { cn } from "@/lib/utils";

export function SessionActions({ session, className }: { session: Session; className?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Button
        className="bg-green-400/30 text-white/75 hover:bg-green-400/60"
        disabled={session.status !== "idle"}
        icon={Play}
        iconClassName="fill-current"
        label="Start"
        onClick={session.start}
      />
      <Button
        className="bg-yellow-400/50 text-white/75 hover:bg-yellow-400/70"
        disabled={session.status === "idle"}
        icon={Square}
        iconClassName="fill-current"
        label="Stop"
        onClick={session.stop}
        variant="secondary"
      />
      <Button
        className="bg-white/15 text-white/75 hover:bg-white/25 hover:text-white/75"
        disabled={session.items.length === 0}
        icon={Eraser}
        label="Clear"
        onClick={session.clear}
        variant="outline"
      />
    </div>
  );
}
