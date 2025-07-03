import { cn } from "@/lib/utils";
import { WidgetTypes } from "@/lib/types";

export default function Logo({ className }: WidgetTypes) {
  return (
    <h1
      className={cn(
        "mt-2 text-3xl font-bold tracking-widest font-lexend whitespace-nowrap",
        className
      )}
    >
      l
      <span className="inline-block transform scale-x-[-1] rotate-10 mr-0.5">
        e
      </span>
      d<span className="inline-block transform scale-x-[-1] mr-1">a</span>d
    </h1>
  );
}
