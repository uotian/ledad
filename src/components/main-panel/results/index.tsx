"use client";

import { useEffect, useRef } from "react";
import { Eraser } from "lucide-react";
import { Button } from "@/ui/button";
import type { Session } from "@/hooks/use-session";
import { selectItems } from "@/lib/items";
import { EmptyEntry } from "./empty-entry";
import { ItemBlock } from "./item-block";

export function ResultsPanel({ session }: { session: Session }) {
  const { items, clear } = session;
  const bottomRef = useRef<HTMLDivElement>(null);
  const isAutoScrollPausedRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const itemsSelected = selectItems(items);
  const itemLast = itemsSelected.at(-1);

  useEffect(() => {
    if (isAutoScrollPausedRef.current) return;
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [itemsSelected.length, itemLast?.transcripts, itemLast?.translations]);

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
    <div
      role="region"
      aria-label="Transcript and translation"
      className="relative flex min-h-0 min-w-0 basis-2/3 flex-col"
      onPointerDown={pauseAutoScroll}
      onTouchStart={pauseAutoScroll}
      onWheel={pauseAutoScroll}
    >
      <div aria-live="polite" className="min-h-0 flex-1 space-y-2 overflow-y-auto p-4 pb-16">
        {itemsSelected.length === 0 ? (
          <EmptyEntry />
        ) : (
          itemsSelected.map((item) => <ItemBlock item={item} key={item.id} />)
        )}
        <div ref={bottomRef} />
      </div>
      <Button className="absolute right-1 bottom-1 size-auto cursor-pointer rounded-full border-none p-2" variant="ghost" size="icon-sm" aria-label="Clear" title="Clear" disabled={items.length === 0} onClick={clear}>
        <Eraser aria-hidden="true" />
      </Button>
    </div>
  );
}
