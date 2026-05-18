"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import type { Status, Item, Lang } from "@/lib/types";
import { start as startAction } from "./actions/start";
import { stop as stopAction } from "./actions/stop";
import { clear as clearAction } from "./actions/clear";
import type { Refs, Langs, ItemLastRef } from "./types";
import { cleanup } from "./utils";

export function useSession(langFrom: Lang, langTo: Lang) {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const itemLast: ItemLastRef = useRef(null);
  const mic: Refs["mic"] = useRef(null);
  const connection: Refs["connection"] = useRef(null);
  const channel: Refs["channel"] = useRef(null);
  const refs: Refs = useMemo(() => ({ mic, connection, channel }), [mic, connection, channel]);
  const langs: Langs = { from: langFrom, to: langTo };

  useEffect(() => {
    return () => cleanup(refs);
  }, [refs]);

  function start() {
    return startAction({ refs, langs, setStatus, setError, setItems, itemLast });
  }

  function stop() {
    stopAction(refs, setStatus);
  }

  function clear() {
    clearAction(setError, setItems, itemLast);
  }

  return { items, error, status, clear, start, stop };
}

export type Session = ReturnType<typeof useSession>;
