"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import ButtonSquare from "@/components/myui/button-square";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function ThemeToggle() {
  const { setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <ButtonSquare size="sm" className="rounded-l-none border-l-0">
          <Sun
            className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
            strokeWidth={1.5}
          />
          <Moon
            className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
            strokeWidth={1.5}
          />
          <span className="sr-only">テーマを切り替え</span>
        </ButtonSquare>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>ライト</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>ダーク</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>システム</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
