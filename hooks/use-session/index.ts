"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import type { Status, Item, Lang } from "@/lib/types";
import { start as startAction } from "./actions/start";
import { stop as stopAction } from "./actions/stop";
import { clear as clearAction } from "./actions/clear";
import type { Refs, SetStates, Langs } from "./types";
import { cleanup } from "./utils";

export function useSession(langFrom: Lang, langTo: Lang) {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const mic: Refs["mic"] = useRef(null);
  const connection: Refs["connection"] = useRef(null);
  const channel: Refs["channel"] = useRef(null);
  const refs: Refs = useMemo(() => ({ mic, connection, channel }), [mic, connection, channel]);
  const langs: Langs = { from: langFrom, to: langTo };
  const setStates: SetStates = { setStatus, setError, setItems };

  useEffect(() => {
    return () => cleanup(refs);
  }, [refs]);

  function start() {
    return startAction({ refs, langs, setStates });
  }

  function stop() {
    stopAction(refs, setStates);
  }

  function clear() {
    clearAction(setStates);
  }

  return { items, error, status, clear, start, stop };
}

export type Session = ReturnType<typeof useSession>;
