import type { ItemLastRef, SetError, SetItems } from "../types";

export function clear(setError: SetError, setItems: SetItems, itemLast: ItemLastRef) {
  setError(null);
  itemLast.current = null;
  setItems([]);
}
