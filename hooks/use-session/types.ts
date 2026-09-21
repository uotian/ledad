import type { Dispatch, RefObject, SetStateAction } from "react";
import type { ItemFlush, Item, Lang, Status } from "@/lib/types";

export type Refs = {
  mic: RefObject<MediaStream | null>;
  connection: RefObject<RTCPeerConnection | null>;
  channel: RefObject<RTCDataChannel | null>;
};

export type ItemFlushLastRef = RefObject<ItemFlush | null>;

export type Langs = {
  from: Lang;
  to: Lang;
};

export type SetStatus = Dispatch<SetStateAction<Status>>;
export type SetError = Dispatch<SetStateAction<string | null>>;
export type SetItems = Dispatch<SetStateAction<Item[]>>;
