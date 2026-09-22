import { Mic } from "lucide-react";

export function Icon({ active }: { active: boolean }) {
  const className = active ? "text-emerald-300/50" : "text-white/45";
  return <Mic className={`size-5 ${className}`} />;
}
