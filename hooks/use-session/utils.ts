import type { Refs } from "./types";

export function cleanup({ mic, flush, final }: Refs) {
  final.current?.stop();
  final.current = null;

  const flushCurrent = flush.current;
  flush.current = null;
  flushCurrent?.stop();

  mic.current?.getTracks().forEach((track) => track.stop());
  mic.current = null;
}
