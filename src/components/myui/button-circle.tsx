import React from "react";
import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes } from "react";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "destructive" | "muted" | "accent";
  size?: "sm" | "md" | "lg";
  children?: React.ReactNode;
}

export default function ButtonCircle({ variant = "primary", size = "md", className, children, disabled, ...props }: Props) {
  const baseClasses = "rounded-full transition-all duration-200 flex items-center justify-center focus:outline-none";

  const sizeClasses = {
    xs: "h-6 w-6",
    sm: "h-8 w-8",
    md: "h-12 w-14",
    lg: "h-16 w-16",
    xl: "h-20 w-20",
  };

  const variantClasses = {
    primary: "bg-primary/80 hover:bg-primary/80",
    secondary: "bg-secondary/80 hover:bg-secondary/80",
    destructive: "bg-destructive/80 hover:bg-destructive/80",
    muted: "bg-muted/80 hover:bg-muted/80",
    accent: "bg-accent/80 hover:bg-accent/80",
  };

  const disabledClasses = disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer";

  return (
    <button className={cn(baseClasses, sizeClasses[size], variantClasses[variant], disabledClasses, className)} disabled={disabled} {...props}>
      {children}
    </button>
  );
}
