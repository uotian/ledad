"use client";

import { useSyncExternalStore } from "react";
import type { Lang } from "@/lib/types";
import { getLang, keys, setLangs, subscribeLang } from "@/lib/local-storage";

export function useLang() {
  const langFrom = useSyncExternalStore<Lang>(subscribeLang, () => getLang(keys.from, "en"), () => "en");
  const langTo = useSyncExternalStore<Lang>(subscribeLang, () => getLang(keys.to, "ja"), () => "ja");

  function setLangFrom(nextLangFrom: Lang) {
    setLangs(nextLangFrom, nextLangFrom === langTo ? langFrom : langTo);
  }

  function setLangTo(nextLangTo: Lang) {
    setLangs(nextLangTo === langFrom ? langTo : langFrom, nextLangTo);
  }

  function swapLangs() {
    setLangs(langTo, langFrom);
  }

  return { langFrom, langTo, setLangFrom, setLangTo, swapLangs };
}

export type LangState = ReturnType<typeof useLang>;
