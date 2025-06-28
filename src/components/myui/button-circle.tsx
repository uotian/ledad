import React from "react";
import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes } from "react";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "red" | "blue" | "gray";
  size?: "sm" | "md" | "lg";
  children?: React.ReactNode;
}

export default function ButtonCircle({ variant = "blue", size = "md", className, children, ...props }: Props) {
  const baseClasses =
    "rounded-full transition-all duration-200 flex items-center justify-center cursor-pointer focus:outline-none";

  const sizeClasses = {
    xs: "h-6 w-6",
    sm: "h-8 w-8",
    md: "h-12 w-12",
    lg: "h-16 w-16",
    xl: "h-20 w-20",
  };

  const variantClasses = {
    red: "bg-red-900/80 hover:bg-red-900/60",
    blue: "bg-blue-900/80 hover:bg-blue-700/60",
    gray: "bg-gray-900/80 cursor-not-allowed",
  };

  return (
    <button className={cn(baseClasses, sizeClasses[size], variantClasses[variant], className)} {...props}>
      {children}
    </button>
  );
}
