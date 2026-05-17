import type { Dispatch, RefObject, SetStateAction } from "react";
import type { Item, Lang, Status } from "@/lib/types";

export type Refs = {
  mic: RefObject<MediaStream | null>;
  connection: RefObject<RTCPeerConnection | null>;
  channel: RefObject<RTCDataChannel | null>;
};

export type SetStates = {
  setStatus: Dispatch<SetStateAction<Status>>;
  setError: Dispatch<SetStateAction<string | null>>;
  setItems: Dispatch<SetStateAction<Item[]>>;
};

export type Langs = {
  from: Lang;
  to: Lang;
};
