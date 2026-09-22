import type { Settings } from "@/lib/types";
import type { ItemFlushLastRef, Refs, SetError, SetItems, SetStatus } from "../../types";
import { cleanup } from "../../utils";
import { Flush } from "./flush";
import { Final } from "./final";

export async function start({ refs, settings, setStatus, setError, setItems, itemFlushLast }: { refs: Refs; settings: Settings; setStatus: SetStatus; setError: SetError; setItems: SetItems; itemFlushLast: ItemFlushLastRef }) {
  const langs = { from: settings.langFrom, to: settings.langTo };
  itemFlushLast.current = null;
  setStatus("requesting");
  setError(null);
  try {
    refs.mic.current = await navigator.mediaDevices.getUserMedia({ audio: true });
    startFinal();
    await startFlush();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    cleanup(refs);
    setStatus("idle");
    setError(`Could not start: ${message}`);
  }

  function startFinal() {
    const final = new Final(refs, settings, langs, setItems, setError);
    refs.final.current = final;
    final.start();
  }

  async function startFlush() {
    const flush = new Flush(refs, settings, langs, itemFlushLast, setStatus, setError, setItems);
    refs.flush.current = flush;
    await flush.start();
  }
}
