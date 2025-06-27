"use client";

import React, { useState, useEffect } from "react";
import { ArrowRightLeft } from "lucide-react";
import { getLang1, getLang2 } from "@/lib/storage";

interface Props {
  className?: string;
}

const Component: React.FC<Props> = ({ className }) => {
  const [lang1, setLang1] = useState("ja");
  const [lang2, setLang2] = useState("en");
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setLang1(getLang1());
    setLang2(getLang2());
  }, []);

  const infoValue = (value: string): string => {
    return isClient ? value : "loading...";
  };

  return (
    <div className={`flex items-center gap-12 text-sm ${className}`}>
      <div className="flex items-center gap-2">
        <span>{infoValue(lang1.toUpperCase())}</span>
        <ArrowRightLeft className="h-4 w-4" />
        <span>{infoValue(lang2.toUpperCase())}</span>
      </div>
    </div>
  );
};

export default Component;
