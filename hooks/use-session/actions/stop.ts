import type { Refs, SetStatus } from "../types";
import { cleanup } from "../utils";

export function stop(refs: Refs, setStatus: SetStatus) {
  cleanup(refs);
  setStatus("idle");
}
