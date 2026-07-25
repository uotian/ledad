"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import type { Status, Item, Lang } from "@/lib/types";
import { start as startAction } from "./actions/start";
import { stop as stopAction } from "./actions/stop";
import { clear as clearAction } from "./actions/clear";
import { commit as commitAction } from "./actions/commit";
import type { Refs, Langs, ItemLastRef } from "./types";
import { cleanup } from "./utils";
import { finalizeTranscript, updateTranslation } from "./actions/start/on-message";

const SESSION_TIMEOUT_MS = 30 * 60 * 1000;  // 30 minutes
const COMMIT_INTERVAL_MS = 15 * 1000;  // 15 seconds

export function useSession(langFrom: Lang, langTo: Lang) {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const itemLast: ItemLastRef = useRef(null);
  const sessionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const commitTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const mic: Refs["mic"] = useRef(null);
  const connection: Refs["connection"] = useRef(null);
  const channel: Refs["channel"] = useRef(null);
  const refs: Refs = useMemo(() => ({ mic, connection, channel }), [mic, connection, channel]);
  const langs: Langs = { from: langFrom, to: langTo };

  useEffect(() => {
    return () => {
      clearSessionTimer();
      clearCommitTimer();
      cleanup(refs);
    };
  }, [refs]);

  async function start() {
    clearSessionTimer();
    clearCommitTimer();
    await startAction({ refs, langs, setStatus, setError, setItems, itemLast });
    if (refs.channel.current) {
      commitTimer.current = setInterval(() => {
        const item = itemLast.current;
        if (commitAction(refs, setError) && item) {
          void updateTranslation(item, langs, itemLast, setItems);
        }
      }, COMMIT_INTERVAL_MS);
      sessionTimer.current = setTimeout(() => {
        stop();
        setError("Session stopped automatically after 30 minutes.");
      }, SESSION_TIMEOUT_MS);
    }
  }

  function stop() {
    clearSessionTimer();
    clearCommitTimer();
    stopAction(refs, setStatus);
  }

  function clear() {
    clearAction(setError, setItems, itemLast);
  }

  function commit() {
    if (commitAction(refs, setError)) {
      finalizeTranscript(itemLast, langs, setItems);
    }
  }

  return { items, error, status, clear, commit, start, stop };

  function clearSessionTimer() {
    if (sessionTimer.current) {
      clearTimeout(sessionTimer.current);
      sessionTimer.current = null;
    }
  }

  function clearCommitTimer() {
    if (commitTimer.current) {
      clearInterval(commitTimer.current);
      commitTimer.current = null;
    }
  }
}

export type Session = ReturnType<typeof useSession>;
