import { cn } from "@/lib/utils";
import { EmptyEntry } from "@/components/main-panel/empty-entry";
import { TranscriptEntry } from "@/components/main-panel/transcript-entry";
import type { Item } from "@/lib/types";

export function MainPanel({ className, items }: { className?: string; items: Item[] }) {
  return (
    <section aria-live="polite" className={cn("space-y-2 rounded-lg border border-border/60 bg-card p-4 shadow-sm", className)}>
      {items.length === 0 ? (
        <EmptyEntry />
      ) : (
        items.map((item) => <TranscriptEntry item={item} key={item.id} />)
      )}
    </section>
  );
}
