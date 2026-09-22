import { createItemFlush } from "@/lib/items";
import { requestSDP } from "@/lib/transcribe";
import { translate } from "@/lib/translate";
import type { ItemFlush, RealtimeEvent, Settings } from "@/lib/types";
import type { ItemFlushLastRef, Langs, Refs, SetError, SetItems, SetStatus } from "../../types";

const COMMIT_INTERVAL_MS = 15 * 1000;

export class Flush {
  private connection: RTCPeerConnection;
  private channel: RTCDataChannel;
  private timer: ReturnType<typeof setInterval> | null = null;

  constructor(
    private refs: Pick<Refs, "mic" | "flush">,
    private settings: Settings,
    private langs: Langs,
    private itemFlushLast: ItemFlushLastRef,
    private setStatus: SetStatus,
    private setError: SetError,
    private setItems: SetItems,
  ) {
    const mic = refs.mic.current!;
    this.connection = new RTCPeerConnection();
    mic.getAudioTracks().forEach((track) => this.connection.addTrack(track, mic));
    this.channel = this.connection.createDataChannel("oai-events");
  }

  async start() {
    this.channel.addEventListener("open", () => {
      if (this.refs.flush.current === this) this.setStatus("listening");
    });
    this.channel.addEventListener("message", (message) => {
      if (this.refs.flush.current === this) this.onMessage(message);
    });
    this.channel.addEventListener("error", () => {
      if (this.refs.flush.current === this) this.setError("Connection error. Please start again.");
    });
    this.setStatus("connecting");
    const offer = await this.connection.createOffer();
    if (!offer.sdp) throw new Error("Could not create SDP for Realtime connection.");
    await this.connection.setLocalDescription(offer);
    const sdp = await requestSDP({ sdp: offer.sdp, settings: this.settings });
    await this.connection.setRemoteDescription({ type: "answer", sdp });
    if (this.refs.flush.current === this) {
      this.timer = setInterval(() => this.commit(), COMMIT_INTERVAL_MS);
    }
  }

  commit() {
    const itemFlush = this.itemFlushLast.current;
    if (this.sendCommit() && itemFlush) {
      void this.updateTranslation(itemFlush);
    }
  }

  finalize() {
    if (this.sendCommit()) this.finalizeItem();
  }

  stop() {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
    this.channel.close();
    this.connection.getSenders().forEach((sender) => sender.track?.stop());
    this.connection.close();
  }

  private sendCommit() {
    let sent = false;
    if (this.channel.readyState !== "open") {
      this.setError("Could not commit: the session is not listening.");
    } else {
      try {
        const eventId = `commit_${crypto.randomUUID()}`;
        this.setError(null);
        this.channel.send(JSON.stringify({ event_id: eventId, type: "input_audio_buffer.commit" }));
        sent = true;
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        this.setError(`Could not commit: ${message}`);
      }
    }
    return sent;
  }

  private onMessage(message: MessageEvent<string>) {
    try {
      const event = JSON.parse(message.data) as RealtimeEvent;
      if (event.type === "error") {
        this.setError(event.error?.message ?? "Realtime API error.");
      } else {
        if (event.type === "conversation.item.input_audio_transcription.delta") this.handleDelta(event);
      }
    } catch {
      this.setError("Could not read speech event.");
    }
  }

  private handleDelta(event: RealtimeEvent) {
    if (event.delta) {
      for (const delta of this.splitDelta(event.delta)) {
        const itemFlush = this.updateItem(delta.text);
        if (delta.isEnd) {
          this.finalizeItem();
        } else if (delta.shouldTranslate || event.delta === " ") {
          void this.updateTranslation(itemFlush);
        }
      }
    }
  }

  private splitDelta(delta: string) {
    const charsEnd = [".", "。", "?", "？", "!", "！"];
    const charsTranslate = [...charsEnd, ",", "、"];
    const deltas: { text: string; isEnd: boolean; shouldTranslate: boolean }[] = [];
    let text = "";
    for (const char of delta) {
      text += char;
      if (charsTranslate.includes(char)) {
        const isEnd = charsEnd.includes(char);
        deltas.push({ text, isEnd, shouldTranslate: true });
        text = "";
      }
    }
    if (text) deltas.push({ text, isEnd: false, shouldTranslate: false });
    return deltas;
  }

  private updateItem(delta: string) {
    const itemFlushCurrent = this.itemFlushLast.current;
    const itemFlushNew = itemFlushCurrent
      ? { ...itemFlushCurrent, transcripts: [itemFlushCurrent.transcripts[0] + delta] }
      : createItemFlush({ id: crypto.randomUUID(), startedAt: new Date().toISOString(), transcript: delta });

    this.itemFlushLast.current = itemFlushNew;
    this.setItems((items) => items.some((item) => item.id === itemFlushNew.id)
      ? items.map((item) => (item.id === itemFlushNew.id ? itemFlushNew : item))
      : [...items, itemFlushNew]);
    return itemFlushNew;
  }

  private finalizeItem() {
    const itemFlush = this.itemFlushLast.current;
    if (itemFlush) {
      const itemFlushEnded = { ...itemFlush, endedAt: new Date().toISOString() };
      this.itemFlushLast.current = null;
      this.setItems((items) => items.map((item) => item.id === itemFlushEnded.id ? itemFlushEnded : item));
      void this.updateTranslation(itemFlushEnded);
    }
  }

  private async updateTranslation(item: ItemFlush) {
    const text = item.transcripts[0];
    if (text.trim()) {
      try {
        const translation = await translate({ langFrom: this.langs.from, langTo: this.langs.to, text });
        if (this.itemFlushLast.current?.id === item.id) this.itemFlushLast.current = { ...this.itemFlushLast.current, translations: [translation] };
        this.setItems((itemsCurrent) =>
          itemsCurrent.map((itemCurrent) =>
            itemCurrent.id === item.id ? { ...itemCurrent, translations: [translation] } : itemCurrent,
          ),
        );
      } catch (error) {
        console.error("Could not translate flush item.", error);
      }
    }
  }
}
