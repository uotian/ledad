"use client";

import { useEffect, useRef } from "react";
import { Eraser } from "lucide-react";
import { Button } from "@/ui/button";
import { cn } from "@/lib/utils";
import { EmptyEntry } from "@/components/main-panel/empty-entry";
import { ItemBlock } from "@/components/main-panel/item-block";
import type { Item, TextSize } from "@/lib/types";

const textSizeClasses = { S: "text-xs", M: "text-sm", L: "text-lg" };

export function MainPanel({ className, items, onClear, textSize }: { className?: string; items: Item[]; onClear: () => void; textSize: TextSize }) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const isAutoScrollPausedRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const itemLast = items.at(-1);

  useEffect(() => {
    if (isAutoScrollPausedRef.current) return;
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [items.length, itemLast?.transcript, itemLast?.translation, itemLast?.status]);

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
      className={cn("relative flex flex-col overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm", textSizeClasses[textSize], className)}
      onPointerDown={pauseAutoScroll}
      onTouchStart={pauseAutoScroll}
      onWheel={pauseAutoScroll}
    >
      <div aria-live="polite" className="min-h-0 flex-1 space-y-2 overflow-y-auto p-4 pb-16">
        {items.length === 0 ? (
          <EmptyEntry />
        ) : (
          items.map((item) => <ItemBlock item={item} key={item.id} />)
        )}
        <div ref={bottomRef} />
      </div>
      <Button className="absolute right-1 bottom-1 size-auto cursor-pointer rounded-full border-none p-2" variant="ghost" size="icon-sm" aria-label="Clear" title="Clear" disabled={items.length === 0} onClick={onClear}>
        <Eraser aria-hidden="true" />
      </Button>
    </section>
  );
}
