import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
}

export default function Logo({ className }: LogoProps) {
  return (
    <h1 className={cn("mt-2 text-xl md:text-3xl font-bold tracking-widest text-foreground/80 font-lexend", className)}>
      l<span className="inline-block transform scale-x-[-1] rotate-10 mr-0.5">e</span>d
      <span className="inline-block transform scale-x-[-1] mr-1">a</span>d
    </h1>
  );
}
