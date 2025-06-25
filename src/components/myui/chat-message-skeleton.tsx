import { Skeleton } from "@/components/ui/skeleton";

interface ChatMessageSkeletonProps {
  type: "sent" | "received";
  w: string;
  h: string;
}

export function ChatMessageSkeleton({ type, w, h }: ChatMessageSkeletonProps) {
  if (type === "sent") {
    return (
      <div className="flex items-start justify-end gap-3">
        <div className="max-w-xs text-right">
          <Skeleton className="h-4 w-16 mb-1 ml-auto" />
          <Skeleton className={`${h} ${w} rounded-lg ml-auto`} />
        </div>
        <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3">
      <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
      <div className="max-w-xs">
        <Skeleton className="h-4 w-16 mb-1" />
        <Skeleton className={`${h} ${w} rounded-lg`} />
      </div>
    </div>
  );
}
