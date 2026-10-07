import type { Item } from "@/lib/types";
import { formatSentences } from "@/lib/utils/sentences";
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
      <div className="flex items-baseline gap-2">
        <time className="text-[0.85em] text-orange-900/75" dateTime={item.startedAt}>
          {time}
        </time>
        <span className={cn("text-[0.72em] font-medium", item.type === "final" ? "text-emerald-700" : "text-muted-foreground")}>
          {item.type === "final" ? "確定版" : "速報"}
        </span>
      </div>
      {item.transcripts.map((transcript, index) => (
        <div className="grid grid-cols-2 gap-x-4" key={index}>
          <p className="min-w-0 whitespace-pre-line wrap-anywhere text-blue-950/75">{formatSentences(transcript)}</p>
          <p className={cn("min-w-0 whitespace-pre-line wrap-anywhere border-l border-border pl-4 text-foreground/88", !item.translations[index] && "animate-pulse")}>{item.translations[index] ? formatSentences(item.translations[index]) : "..."}</p>
        </div>
      ))}
    </article>
  );
}
