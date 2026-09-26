import type { Settings } from "@/lib/types";
import type { ItemFlushLastRef, Refs, SetError, SetItems, SetStatus } from "../../types";
import { cleanup } from "../../utils";
import { Final } from "./final";
import { createFlush, type Flush } from "./flush";

export type StartArgs = {
  refs: Refs;
  settings: Settings;
  setStatus: SetStatus;
  setError: SetError;
  setItems: SetItems;
  itemFlushLast: ItemFlushLastRef;
};

export async function start({ refs, settings, setStatus, setError, setItems, itemFlushLast }: StartArgs) {
  itemFlushLast.current = null;
  setStatus("requesting");
  setError(null);
  let final: Final | null = null;
  let flush: Flush | null = null;

  try {
    final = new Final(refs, settings, setItems, setError);
    refs.final.current = final;
    flush = createFlush(refs, settings, itemFlushLast, setStatus, fail, setItems);
    refs.flush.current = flush;

    const mic = await navigator.mediaDevices.getUserMedia({ audio: true });
    if (refs.flush.current === flush) {
      refs.mic.current = mic;
      final.start();
      await flush.start();
    } else {
      mic.getTracks().forEach((track) => track.stop());
    }
  } catch (error) {
    const cancelled = error instanceof DOMException && error.name === "AbortError";
    if (!cancelled) {
      const message = error instanceof Error ? error.message : String(error);
      fail(`Could not start: ${message}`);
    }
  }

  function fail(message: string) {
    if (flush === null || refs.flush.current === flush) {
      cleanup(refs);
      setStatus("idle");
      setError(message);
    }
  }
}
