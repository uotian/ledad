"use client";

import { useState, useEffect } from "react";
import { Globe, Check } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import ButtonSquare from "@/components/myui/button-square";
import { getLang, setLang, langMap } from "@/lib/storage";

export default function Lang() {
  const [currentLang, setCurrentLang] = useState<string>("en");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setCurrentLang(getLang());
  }, []);

  const handleLanguageChange = (lang: string) => {
    setLang(lang);
    setCurrentLang(lang);
    // ページをリロードして変更を反映
    window.location.reload();
  };

  // サーバーサイドレンダリング時は何も表示しない
  if (!mounted) {
    return (
      <ButtonSquare size="sm" className="rounded-r-none">
        <Globe className="w-4 h-4" strokeWidth={1.5} />
      </ButtonSquare>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <ButtonSquare size="sm" className="rounded-r-none">
          <Globe className="w-4 h-4" strokeWidth={1.5} />
        </ButtonSquare>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {Object.entries(langMap).map(([code, name]) => (
          <DropdownMenuItem key={code} onClick={() => handleLanguageChange(code)} className="flex items-center justify-between">
            <span>{name}</span>
            {currentLang === code && <Check className="w-4 h-4" strokeWidth={2} />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
