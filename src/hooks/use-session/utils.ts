import type { Refs } from "./types";

export function cleanup({ mic, final, flush }: Refs) {
  final.current?.stop();
  final.current = null;

  flush.current?.stop();
  flush.current = null;

  mic.current?.getTracks().forEach((track) => track.stop());
  mic.current = null;
}
