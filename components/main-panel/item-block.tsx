import type { Item } from "@/lib/types";
import { cn } from "@/lib/utils";

const timeFormatter = new Intl.DateTimeFormat("sv-SE", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
});

export function ItemBlock({ item }: { item: Item }) {
  const time = timeFormatter.format(new Date(item.startedAt));

  return (
    <article className="py-1 flex flex-col gap-0.5">
      <time className="text-[0.85em] text-orange-900/75" dateTime={item.startedAt}>
        {time}
      </time>
      <p className="text-blue-950/75">{item.transcript}</p>
      <p className={cn("text-foreground/88", !item.translation && "animate-pulse")}>{item.translation || "..."}</p>
    </article>
  );
}
