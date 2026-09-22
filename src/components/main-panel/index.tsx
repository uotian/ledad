"use client";

import { cn } from "@/lib/utils";
import type { Settings } from "@/lib/types";
import type { Session } from "@/hooks/use-session";
import type { Insights } from "@/hooks/use-insights";
import { InsightsPanel } from "./insights";
import { ResultsPanel } from "./results";

const textSizeClasses = { S: "text-xs", M: "text-sm", L: "text-lg" };

export function MainPanel({ className, session, settings, insights }: { className?: string; session: Session; settings: Settings; insights: Insights }) {
  const { data, error, updating, canRefresh, refresh } = insights;

  return (
    <section className={cn("flex flex-col overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm md:flex-row", textSizeClasses[settings.textSize], className)}>
      <InsightsPanel data={data} error={session.status === "listening" ? error : null} updating={updating} canRefresh={canRefresh} onRefresh={refresh} />
      <ResultsPanel session={session} />
    </section>
  );
}
