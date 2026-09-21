import { describe, expect, it } from "vitest";
import { createItemFinal, createItemFlush } from "@/lib/items";

describe("timeline item factories", () => {
  it("creates a flush item without changing the existing transcript fields", () => {
    expect(createItemFlush({ id: "flush-id", startedAt: "2026-09-22T00:00:00.000Z", transcript: "Hello" })).toEqual({
      id: "flush-id",
      startedAt: "2026-09-22T00:00:00.000Z",
      transcript: "Hello",
      translation: "",
      type: "flush",
    });
  });

  it("defines the future final item with its covered time range", () => {
    expect(createItemFinal({
      id: "final-id",
      startedAt: "2026-09-22T00:00:00.000Z",
      endedAt: "2026-09-22T00:01:00.000Z",
      transcript: "Hello.",
    })).toEqual({
      id: "final-id",
      startedAt: "2026-09-22T00:00:00.000Z",
      endedAt: "2026-09-22T00:01:00.000Z",
      transcript: "Hello.",
      translation: "",
      type: "final",
    });
  });
});
