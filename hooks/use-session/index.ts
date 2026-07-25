"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import type { Status, Item, Lang } from "@/lib/types";
import { start as startAction } from "./actions/start";
import { stop as stopAction } from "./actions/stop";
import { clear as clearAction } from "./actions/clear";
import type { Refs, Langs, ItemLastRef } from "./types";
import { cleanup } from "./utils";

const SESSION_TIMEOUT_MS = 30 * 60 * 1000;

export function useSession(langFrom: Lang, langTo: Lang) {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const itemLast: ItemLastRef = useRef(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mic: Refs["mic"] = useRef(null);
  const connection: Refs["connection"] = useRef(null);
  const channel: Refs["channel"] = useRef(null);
  const refs: Refs = useMemo(() => ({ mic, connection, channel }), [mic, connection, channel]);
  const langs: Langs = { from: langFrom, to: langTo };

  useEffect(() => {
    return () => {
      clearTimer();
      cleanup(refs);
    };
  }, [refs]);

  async function start() {
    clearTimer();
    await startAction({ refs, langs, setStatus, setError, setItems, itemLast });
    if (refs.channel.current) {
      timer.current = setTimeout(() => {
        stopAction(refs, setStatus);
        setError("Session stopped automatically after 30 minutes.");
      }, SESSION_TIMEOUT_MS);
    }
  }

  function stop() {
    clearTimer();
    stopAction(refs, setStatus);
  }

  function clear() {
    clearAction(setError, setItems, itemLast);
  }

  return { items, error, status, clear, start, stop };

  function clearTimer() {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  }
}

export type Session = ReturnType<typeof useSession>;
