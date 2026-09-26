import type { Dispatch, RefObject, SetStateAction } from "react";
import type { ItemFlush, Item, Status } from "@/lib/types";

export type Refs = {
  mic: RefObject<MediaStream | null>;
  final: RefObject<{ stop: () => void } | null>;
  flush: RefObject<{ stop: () => void } | null>;
};

export type ItemFlushLastRef = RefObject<ItemFlush | null>;

export type SetStatus = Dispatch<SetStateAction<Status>>;
export type SetError = Dispatch<SetStateAction<string | null>>;
export type SetItems = Dispatch<SetStateAction<Item[]>>;
