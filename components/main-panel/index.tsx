"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { EmptyEntry } from "@/components/main-panel/empty-entry";
import { ItemBlock } from "@/components/main-panel/item-block";
import type { Item } from "@/lib/types";

export function MainPanel({ className, items }: { className?: string; items: Item[] }) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const isAutoScrollPausedRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const itemLast = items.at(-1);

  useEffect(() => {
    if (isAutoScrollPausedRef.current) return;
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [items.length, itemLast?.transcript, itemLast?.translation]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  function pauseAutoScroll() {
    isAutoScrollPausedRef.current = true;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      isAutoScrollPausedRef.current = false;
    }, 10000);
  }

  return (
    <section
      aria-live="polite"
      className={cn("space-y-2 rounded-lg border border-border/60 bg-card p-4 shadow-sm", className)}
      onPointerDown={pauseAutoScroll}
      onTouchStart={pauseAutoScroll}
      onWheel={pauseAutoScroll}
    >
      {items.length === 0 ? (
        <EmptyEntry />
      ) : (
        items.map((item) => <ItemBlock item={item} key={item.id} />)
      )}
      <div ref={bottomRef} />
    </section>
  );
}
