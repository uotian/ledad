import React from "react";
import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes } from "react";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "red" | "blue" | "gray";
  size?: "sm" | "md" | "lg";
  children?: React.ReactNode;
}

export default function ButtonSquare({ size = "md", className, children, ...props }: Props) {
  const baseClasses = "inline-flex items-center justify-center rounded-lg cursor-pointer focus:outline-none transition-all duration-200";
  const colorClasses = "bg-foreground/60 hover:bg-foreground/40 border-[1px] border text-background ";

  const sizeClasses = {
    xs: "h-8 w-8",
    sm: "h-10 w-10",
    md: "h-12 w-12",
    lg: "h-16 w-16",
    xl: "h-20 w-20",
  };

  return (
    <button className={cn(baseClasses, sizeClasses[size], colorClasses, className)} {...props}>
      {children}
    </button>
  );
}
