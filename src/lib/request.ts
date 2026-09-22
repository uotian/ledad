import { LANGS, type Lang } from "@/lib/types";

export function readLang(request: Request, headerName: string, fallback: Lang) {
  const value = request.headers.get(headerName);
  return value && LANGS.includes(value as Lang) ? (value as Lang) : fallback;
}
