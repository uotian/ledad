"use client";

import { useCallback, useEffect, useEffectEvent, useRef, useState } from "react";
import type { Item, Settings } from "@/lib/types";
import { generateInsights, insightsSnapshot, type InsightsResult } from "@/lib/insights";

export const INSIGHTS_INTERVAL_MS = 30_000;

export function useInsights(items: Item[], enabled: boolean, settings: Settings) {
  const { langInsight: lang } = settings;
  const [data, setData] = useState<InsightsResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const request = useRef<AbortController | null>(null);
  const lastSnapshot = useRef("");
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancel = useCallback(() => {
    if (timeout.current) clearTimeout(timeout.current);
    timeout.current = null;
    request.current?.abort();
    request.current = null;
    setUpdating(false);
  }, []);

  const stopUpdates = useCallback(() => {
    if (timer.current) clearInterval(timer.current);
    timer.current = null;
    cancel();
  }, [cancel]);

  const update = useCallback(async (force: boolean) => {
    if (!enabled || request.current) return;
    const input = insightsSnapshot(items, lang);
    if (!input.items.length) return;
    const snapshot = JSON.stringify(input);
    if (!force && snapshot === lastSnapshot.current) return;

    const controller = new AbortController();
    request.current = controller;
    setUpdating(true);
    setError(null);
    const deadline = setTimeout(() => controller.abort(), 60_000);
    timeout.current = deadline;
    try {
      const result = await generateInsights(input, controller.signal);
      if (!controller.signal.aborted && request.current === controller) {
        lastSnapshot.current = snapshot;
        setData(result);
        setError(null);
      }
    } catch (error) {
      if (request.current === controller) setError(error instanceof Error ? error.message : "Could not update insights. Retrying…");
    } finally {
      clearTimeout(deadline);
      if (timeout.current === deadline) timeout.current = null;
      if (request.current === controller) {
        request.current = null;
        setUpdating(false);
      }
    }
  }, [items, enabled, lang]);

  const tick = useEffectEvent(() => update(false));

  useEffect(() => {
    if (enabled) timer.current = setInterval(() => void tick(), INSIGHTS_INTERVAL_MS);
    return stopUpdates;
  }, [enabled, lang, stopUpdates]);

  const canRefresh = enabled && !updating && insightsSnapshot(items, lang).items.length > 0;
  const refresh = () => { void update(true); };

  return { data, error, updating, canRefresh, refresh };
}

export type Insights = ReturnType<typeof useInsights>;
