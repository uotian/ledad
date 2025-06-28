"use client";

import { useState } from "react";
import ThemeToggle from "./theme-toggle";
import Trash from "./trash";
import Setting from "./setting";
import { Palette } from "lucide-react";
import ButtonSquare from "@/components/myui/button-square";
import ColorsDialog from "./colors-dialog";

export default function Actions() {
  const [colorsDialogOpen, setColorsDialogOpen] = useState(false);

  return (
    <>
      <div className="flex items-center">
        <ButtonSquare size="sm" className="rounded-r-none" onClick={() => setColorsDialogOpen(true)}>
          <Palette className="w-5 h-5" strokeWidth={1.5} />
        </ButtonSquare>
        <Trash />
        <Setting />
        <ThemeToggle />
      </div>

      <ColorsDialog open={colorsDialogOpen} onOpenChange={setColorsDialogOpen} />
    </>
  );
}
