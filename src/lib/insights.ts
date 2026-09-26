import { LANGS, type Item, type Lang } from "@/lib/types";
import { selectItems } from "@/lib/items";

export type Topic = { title: string; summary: string };
export type InsightsResult = { allTopics: Topic[]; currentTopic: Topic | null };
export type InsightsRequest = { lang: Lang; items: Item[] };

export function insightsSnapshot(items: Item[], lang: Lang): InsightsRequest {
  return { lang, items: selectItems(items).filter((item) => item.transcripts.some((text) => text.trim())) };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isTopic(value: unknown): value is Topic {
  return isRecord(value)
    && typeof value.title === "string" && !!value.title.trim() && value.title.length <= 160
    && typeof value.summary === "string" && !!value.summary.trim() && value.summary.length <= 1200;
}

export function isInsightsResult(value: unknown): value is InsightsResult {
  return isRecord(value) && Array.isArray(value.allTopics) && value.allTopics.length <= 50
    && value.allTopics.every(isTopic) && (value.currentTopic === null || isTopic(value.currentTopic));
}

export function isInsightsRequest(value: unknown): value is InsightsRequest {
  const isDate = (date: unknown) => typeof date === "string" && Number.isFinite(Date.parse(date));
  const isTextList = (texts: unknown) => Array.isArray(texts) && texts.length <= 500
    && texts.every((text) => typeof text === "string");
  return isRecord(value) && LANGS.some((lang) => lang === value.lang)
    && Array.isArray(value.items) && value.items.length > 0 && value.items.length <= 2000
    && value.items.every((item: unknown) => isRecord(item)
      && typeof item.id === "string" && item.id.length > 0 && item.id.length <= 200
      && (item.type === "flush" || item.type === "final") && isDate(item.startedAt)
      && (item.type === "final" ? isDate(item.endedAt) : item.endedAt === undefined || isDate(item.endedAt))
      && isTextList(item.transcripts) && (item.transcripts as string[]).some((text) => text.trim())
      && isTextList(item.translations));
}

export async function generateInsights(input: InsightsRequest, signal: AbortSignal): Promise<InsightsResult> {
  const response = await fetch("/api/insights/openai", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
    signal,
  });
  const payload: unknown = await response.json();
  if (response.ok && isInsightsResult(payload)) return payload;
  throw new Error(isRecord(payload) && typeof payload.error === "string" ? payload.error : "Could not read insights.");
}
