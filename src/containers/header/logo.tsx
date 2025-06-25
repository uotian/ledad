import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
}

export default function Logo({ className }: LogoProps) {
  return <h1 className={cn("text-2xl font-bold tracking-widest", className)}>HooTalk</h1>;
}
