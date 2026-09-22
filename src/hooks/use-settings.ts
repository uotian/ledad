"use client";

import { useMemo, useSyncExternalStore } from "react";
import type { Settings } from "@/lib/types";
import { defaultSettings, isSettings } from "@/lib/settings";

export const settingsKey = "ledad:settings:v1";
const settingsEvent = "ledad:settings-changed";

export function useSettings() {
  const snapshot = useSyncExternalStore(subscribe, () => window.localStorage.getItem(settingsKey) ?? "{}", () => null);
  const settings = useMemo(() => {
    let settings = defaultSettings;
    if (snapshot !== null) {
      try {
        const parsed: unknown = JSON.parse(snapshot);
        if (typeof parsed === "object" && parsed !== null) {
          const saved = { ...defaultSettings, ...parsed };
          if (isSettings(saved)) settings = saved;
        }
      } catch {
        // Keep the defaults if stored settings cannot be read.
      }
    }
    return settings;
  }, [snapshot]);
  return { settings, saveSettings };
}

function saveSettings(settings: Settings) {
  window.localStorage.setItem(settingsKey, JSON.stringify(settings));
  window.dispatchEvent(new Event(settingsEvent));
}

function subscribe(callback: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key === settingsKey || event.key === null) callback();
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(settingsEvent, callback);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(settingsEvent, callback);
  };
}
