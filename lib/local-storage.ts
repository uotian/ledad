import { LANGS, type Lang } from "@/lib/types";

export const keys = { from: "langFrom", to: "langTo" };
const LANG_STORAGE_EVENT = "ledad:lang-storage";

export function getLang(key: string, fallback: Lang) {
  if (typeof window === "undefined") return fallback;

  const value = window.localStorage.getItem(key);
  return value && LANGS.includes(value as Lang) ? (value as Lang) : fallback;
}

export function setLangs(langFrom: Lang, langTo: Lang) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(keys.from, langFrom);
  window.localStorage.setItem(keys.to, langTo);
  window.dispatchEvent(new Event(LANG_STORAGE_EVENT));
}

export function subscribeLang(callback: () => void) {
  if (typeof window === "undefined") return () => {};

  const onStorage = (event: StorageEvent) => {
    if (event.key === keys.from || event.key === keys.to) callback();
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(LANG_STORAGE_EVENT, callback);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(LANG_STORAGE_EVENT, callback);
  };
}
