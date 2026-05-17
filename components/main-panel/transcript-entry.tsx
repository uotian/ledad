import type { Item } from "@/lib/types";

export function TranscriptEntry({ item }: { item: Item }) {
  return (
    <article>
      <p className="text-sm text-foreground/50">{item.transcript}</p>
      <p className="text-sm text-foreground/88">{item.translation}</p>
    </article>
  );
}
