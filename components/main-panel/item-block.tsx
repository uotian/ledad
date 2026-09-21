import type { Item } from "@/lib/types";
import { cn } from "@/lib/utils";

const timeFormatter = new Intl.DateTimeFormat("ja-JP", {
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
});

export function ItemBlock({ item }: { item: Item }) {
  const startedAt = item.startedAt ?? item.id;
  const time = timeFormatter.format(new Date(startedAt));

  return (
    <article className="py-1 flex flex-col gap-0.5">
      <time className="text-[0.85em] text-orange-900/75" dateTime={startedAt}>
        {time}
      </time>
      <span className={cn("text-[0.72em] font-medium", item.status === "final" ? "text-emerald-700" : "text-muted-foreground")}>
        {item.status === "final" ? "確定版" : "速報"}
      </span>
      <p className="text-blue-950/75">{item.transcript}</p>
      <p className={cn("text-foreground/88", !item.translation && "animate-pulse")}>{item.translation || "..."}</p>
    </article>
  );
}
