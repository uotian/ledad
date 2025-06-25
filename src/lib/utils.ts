import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * localStorageから値を安全に取得する関数
 * @param key localStorageのキー
 * @param defaultValue デフォルト値
 * @returns 保存された値またはデフォルト値
 */
export function getStorageValue(key: string, defaultValue: string): string {
  if (typeof window !== "undefined") {
    return localStorage.getItem(key) || defaultValue;
  }
  return defaultValue;
}
