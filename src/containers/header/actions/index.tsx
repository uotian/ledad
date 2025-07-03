"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
// import { Palette } from "lucide-react";
import {
  Moon,
  Sun,
  Settings,
  PanelRightOpen,
  PanelRightClose,
  Palette,
} from "lucide-react";
import ButtonSquare from "@/components/myui/button-square";
import SettingDialog from "./setting-dialog";
import ColorsDialog from "./colors-dialog";

interface ActionsProps {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
}

export default function Actions({ sidebarOpen, toggleSidebar }: ActionsProps) {
  const [colorsDialogOpen, setColorsDialogOpen] = useState(false);
  const [settingDialogOpen, setSettingDialogOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="flex items-center">
      {/* カラーパレットボタン */}
      <ButtonSquare
        size="sm"
        className="rounded-r-none border-r-0"
        onClick={() => setColorsDialogOpen(true)}
      >
        <Palette className="w-4 h-4" strokeWidth={1.5} />
      </ButtonSquare>
      {/* 設定ボタン */}
      <ButtonSquare
        size="sm"
        className="rounded-none"
        onClick={() => setSettingDialogOpen(true)}
      >
        <Settings className="w-4 h-4" strokeWidth={1.5} />
      </ButtonSquare>
      {/* テーマ切り替えボタン */}
      <ButtonSquare
        size="sm"
        className="rounded-none border-l-0"
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      >
        {mounted && theme === "dark" ? (
          <Sun className="h-5 w-5" strokeWidth={1} />
        ) : (
          <Moon className="h-5 w-5" strokeWidth={1} />
        )}
      </ButtonSquare>
      {/* サイドバートグルボタン */}
      <ButtonSquare
        size="sm"
        className="rounded-l-none border-l-0"
        onClick={toggleSidebar}
      >
        {sidebarOpen ? (
          <PanelRightClose className="w-4 h-4" strokeWidth={1.5} />
        ) : (
          <PanelRightOpen className="w-4 h-4" strokeWidth={1.5} />
        )}
      </ButtonSquare>
      <ColorsDialog
        open={colorsDialogOpen}
        onOpenChange={setColorsDialogOpen}
      />
      <SettingDialog
        open={settingDialogOpen}
        onOpenChange={setSettingDialogOpen}
      />
    </div>
  );
}
