import type { ItemFlushLastRef, SetError, SetItems } from "../types";

export function clear(setError: SetError, setItems: SetItems, itemFlushLast: ItemFlushLastRef) {
  setError(null);
  itemFlushLast.current = null;
  setItems([]);
}
