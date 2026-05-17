import type { Refs, SetStates } from "../types";
import { cleanup } from "../utils";

export function stop(refs: Refs, { setStatus }: SetStates) {
  cleanup(refs);
  setStatus("idle");
}
