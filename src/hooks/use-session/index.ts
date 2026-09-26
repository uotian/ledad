"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import type { Status, Item, Settings } from "@/lib/types";
import { start as startAction } from "./actions/start";
import { stop as stopAction } from "./actions/stop";
import { clear as clearAction } from "./actions/clear";
import type { Refs, ItemFlushLastRef } from "./types";
import { cleanup } from "./utils";

const SESSION_TIMEOUT_MS = 30 * 60 * 1000;  // 30 minutes

export function useSession(settings: Settings) {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const itemFlushLast: ItemFlushLastRef = useRef(null);
  const sessionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mic: Refs["mic"] = useRef(null);
  const final: Refs["final"] = useRef(null);
  const flush: Refs["flush"] = useRef(null);
  const refs: Refs = useMemo(() => ({ mic, final, flush }), [mic, final, flush]);

  useEffect(() => {
    return () => {
      clearSessionTimer();
      cleanup(refs);
    };
  }, [refs]);

  useEffect(() => {
    if (status === "idle") clearSessionTimer();
  }, [status]);

  async function start() {
    clearSessionTimer();
    await startAction({ refs, settings, setStatus, setError, setItems, itemFlushLast });
    if (refs.flush.current) {
      sessionTimer.current = setTimeout(() => {
        stop();
        setError("Session stopped automatically after 30 minutes.");
      }, SESSION_TIMEOUT_MS);
    }
  }

  function stop() {
    clearSessionTimer();
    stopAction(refs, setStatus);
  }

  function clear() {
    clearAction(setError, setItems, itemFlushLast);
  }

  return { items, error, status, clear, start, stop };

  function clearSessionTimer() {
    if (sessionTimer.current) {
      clearTimeout(sessionTimer.current);
      sessionTimer.current = null;
    }
  }
}

export type Session = ReturnType<typeof useSession>;
