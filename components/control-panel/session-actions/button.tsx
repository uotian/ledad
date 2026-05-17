import type { LucideIcon } from "lucide-react";
import { Button as ButtonUI } from "@/ui/button";
import { cn } from "@/lib/utils";

export function Button({ className, disabled, icon: Icon, iconClassName, label, onClick, variant }: { className?: string; disabled: boolean; icon: LucideIcon; iconClassName?: string; label: string; onClick: () => void; variant?: "default" | "secondary" | "outline" }) {
  return (
    <ButtonUI
      aria-label={label}
      className={cn("rounded-full border-none", className)}
      disabled={disabled}
      size="icon-lg"
      type="button"
      variant={variant}
      onClick={onClick}
    >
      <Icon className={cn("size-4", iconClassName)} />
    </ButtonUI>
  );
}
