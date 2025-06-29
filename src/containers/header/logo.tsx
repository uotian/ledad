import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
}

export default function Logo({ className }: LogoProps) {
  return <h1 className={cn("mt-2 text-xl md:text-3xl font-bold tracking-widest text-foreground/80", className)}>HooTalk</h1>;
}
