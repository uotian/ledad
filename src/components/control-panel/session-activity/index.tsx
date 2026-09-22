import type { Session } from "@/hooks/use-session";
import { Icon } from "@/components/control-panel/session-activity/icon";
import { Message } from "@/components/control-panel/session-activity/message";

export function SessionActivity({ session }: { session: Session }) {
  return (
    <div className="flex items-center gap-2">
      <Icon active={session.status !== "idle"} />
      <Message error={session.error} message={session.status} />
    </div>
  );
}
