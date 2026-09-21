import { describe, expect, it } from "vitest";
import { replaceWithFinalTranscript } from "@/hooks/use-session/final-transcript";
import type { Item } from "@/lib/types";

const finalItem: Item = {
  id: "2026-01-01T00:01:00.000Z",
  startedAt: "2026-01-01T00:01:00.000Z",
  endedAt: "2026-01-01T00:02:00.000Z",
  status: "final",
  transcript: "Accurate transcript.",
  translation: "",
};

describe("final transcript replacement", () => {
  it("replaces completed drafts in the finalized range and keeps the active draft", () => {
    const items: Item[] = [
      { id: "before", startedAt: "2026-01-01T00:00:30.000Z", endedAt: "2026-01-01T00:00:50.000Z", status: "draft", transcript: "Before", translation: "" },
      { id: "covered", startedAt: "2026-01-01T00:01:10.000Z", endedAt: "2026-01-01T00:01:40.000Z", status: "draft", transcript: "Draft", translation: "" },
      { id: "active", startedAt: "2026-01-01T00:01:50.000Z", status: "draft", transcript: "Still speaking", translation: "" },
    ];

    expect(replaceWithFinalTranscript(items, finalItem)).toEqual([items[0], finalItem, items[2]]);
  });
});
