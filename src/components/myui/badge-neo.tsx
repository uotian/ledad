import React from "react";
import { cn } from "@/lib/utils";

interface BadgeNeoProps {
  variant?: "default" | "destructive" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
  className?: string;
  children: React.ReactNode;
}

export default function BadgeNeo({ variant = "default", size = "md", className, children }: BadgeNeoProps) {
  const baseClasses = "inline-flex items-center justify-center rounded-full font-medium transition-colors";

  const sizeClasses = {
    sm: "h-5 w-5 text-xs",
    md: "h-6 w-6 text-xs",
    lg: "h-8 w-8 text-sm",
  };

  const variantClasses = {
    default: "bg-primary text-primary-foreground",
    destructive: "bg-destructive text-destructive-foreground",
    secondary: "bg-secondary text-secondary-foreground",
    outline: "border border-input bg-background text-foreground",
  };

  return <div className={cn(baseClasses, sizeClasses[size], variantClasses[variant], className)}>{children}</div>;
}
