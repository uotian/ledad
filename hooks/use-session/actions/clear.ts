import type { SetStates } from "../types";

export function clear({ setError, setItems }: SetStates) {
  setError(null);
  setItems([]);
}
