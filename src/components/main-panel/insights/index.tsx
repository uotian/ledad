import type { Topic, InsightsResult } from "@/lib/insights";
import { RefreshCw } from "lucide-react";
import { Button } from "@/ui/button";
import { cn } from "@/lib/utils";

export function InsightsPanel({ data, error, updating = false, canRefresh = false, onRefresh }: { data: InsightsResult | null; error: string | null; updating?: boolean; canRefresh?: boolean; onRefresh?: () => void }) {
  return (
    <aside aria-labelledby="insights-title" className="min-h-0 min-w-0 basis-1/3 overflow-y-auto border-b border-border/60 p-4 md:border-r md:border-b-0">
      <div className="mb-4 flex items-center justify-between gap-2">
        <h2 id="insights-title" className="text-[1.1em] font-semibold">AI Insights</h2>
        <Button variant="ghost" size="icon-sm" className="cursor-pointer rounded-full" aria-label={updating ? "Updating insights" : "Refresh insights"} title={updating ? "Updating insights" : "Refresh insights"} disabled={updating || !canRefresh} onClick={onRefresh}>
          <RefreshCw aria-hidden="true" className={cn(updating && "animate-spin motion-reduce:animate-none")} />
        </Button>
      </div>
      <section aria-labelledby="all-topics-title">
        <h3 id="all-topics-title" className="mb-3 font-medium">All Topics</h3>
        {data?.allTopics.length ? (
          <div className="space-y-2">
            {data.allTopics.map((topic, index) => <TopicEntry key={`${index}:${topic.title}`} topic={topic} />)}
          </div>
        ) : <p className="text-muted-foreground">No topics yet.</p>}
      </section>
      <section aria-labelledby="current-topic-title" className="mt-6 border-t border-border/60 pt-4">
        <h3 id="current-topic-title" className="mb-3 font-medium">Current Topic</h3>
        {data?.currentTopic ? <TopicEntry key={data.currentTopic.title} topic={data.currentTopic} /> : <p className="text-muted-foreground">No current topic.</p>}
      </section>
      {error && <p role="status" className="mt-4 text-[0.85em] text-muted-foreground">{error}</p>}
    </aside>
  );
}

function TopicEntry({ topic }: { topic: Topic }) {
  return (
    <details className="py-1">
      <summary className="cursor-pointer wrap-anywhere font-medium focus-visible:outline-2 focus-visible:outline-ring">{topic.title}</summary>
      <p className="mt-2 whitespace-pre-wrap wrap-anywhere leading-relaxed text-muted-foreground">{topic.summary}</p>
    </details>
  );
}
