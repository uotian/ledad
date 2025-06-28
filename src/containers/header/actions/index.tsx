"use client";

import { useState } from "react";
import { useTheme } from "next-themes";
import { Palette, Trash2, Moon, Sun, Settings } from "lucide-react";
import { clearMessages } from "@/lib/storage";
import ButtonSquare from "@/components/myui/button-square";
import SettingDialog from "./setting-dialog";
import ColorsDialog from "./colors-dialog";

export default function Actions() {
  const [colorsDialogOpen, setColorsDialogOpen] = useState(false);
  const [settingDialogOpen, setSettingDialogOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  const handleClearMessages = () => {
    if (confirm("すべてのメッセージを削除しますか？")) clearMessages();
  };

  const switchTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <>
      <div className="flex items-center">
        <ButtonSquare size="sm" className="rounded-r-none" onClick={() => setColorsDialogOpen(true)}>
          <Palette className="w-4 h-4" strokeWidth={1.5} />
        </ButtonSquare>
        <ButtonSquare size="sm" className="rounded-none border-l-0" onClick={handleClearMessages}>
          <Trash2 className="h-4 w-4" strokeWidth={1.5} />
        </ButtonSquare>
        <ButtonSquare size="sm" className="rounded-none border-l-0" onClick={() => setSettingDialogOpen(true)}>
          <Settings className="w-4 h-4" strokeWidth={1.5} />
        </ButtonSquare>
        <ButtonSquare size="sm" className="rounded-l-none border-l-0" onClick={switchTheme}>
          {theme === "dark" ? <Sun className="h-5 w-5" strokeWidth={1} /> : <Moon className="h-5 w-5" strokeWidth={1} />}
        </ButtonSquare>
      </div>
      <ColorsDialog open={colorsDialogOpen} onOpenChange={setColorsDialogOpen} />
      <SettingDialog open={settingDialogOpen} onOpenChange={setSettingDialogOpen} />
    </>
  );
}
