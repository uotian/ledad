"use client";

import { useState } from "react";
import { useTheme } from "next-themes";
import { Palette, Moon, Sun, Settings } from "lucide-react";
import ButtonSquare from "@/components/myui/button-square";
import SettingDialog from "./setting-dialog";
import ColorsDialog from "./colors-dialog";

export default function Actions() {
  const [colorsDialogOpen, setColorsDialogOpen] = useState(false);
  const [settingDialogOpen, setSettingDialogOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center">
      <ButtonSquare size="sm" className="rounded-r-none" onClick={() => setColorsDialogOpen(true)}>
        <Palette className="w-4 h-4" strokeWidth={1.5} />
      </ButtonSquare>
      <ButtonSquare size="sm" className="rounded-none border-l-0" onClick={() => setSettingDialogOpen(true)}>
        <Settings className="w-4 h-4" strokeWidth={1.5} />
      </ButtonSquare>
      <ButtonSquare size="sm" className="rounded-l-none border-l-0" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
        {theme === "dark" ? <Sun className="h-5 w-5" strokeWidth={1} /> : <Moon className="h-5 w-5" strokeWidth={1} />}
      </ButtonSquare>
      <ColorsDialog open={colorsDialogOpen} onOpenChange={setColorsDialogOpen} />
      <SettingDialog open={settingDialogOpen} onOpenChange={setSettingDialogOpen} />
    </div>
  );
}
