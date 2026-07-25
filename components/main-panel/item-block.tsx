import type { Item } from "@/lib/types";
import { cn } from "@/lib/utils";

const timeFormatter = new Intl.DateTimeFormat("ja-JP", {
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
});

export function ItemBlock({ item }: { item: Item }) {
  const time = timeFormatter.format(new Date(item.id));

  return (
    <article className="py-1 flex flex-col gap-0.5">
      <time className="text-xs text-orange-900/75" dateTime={item.id}>
        {time}
      </time>
      <p className="text-sm text-blue-950/75">{item.transcript}</p>
      <p className={cn("text-sm text-foreground/88", !item.translation && "animate-pulse")}>{item.translation || "..."}</p>
    </article>
  );
}
