"use client";

import React, { useState, useEffect } from "react";
import { ArrowLeftRight } from "lucide-react";
import { lang1Map, lang2Map, voiceMap } from "@/app/local-storages";
import { getLang1, getLang2, getVoice } from "@/app/local-storages";

interface Props {
  className?: string;
}

const Component: React.FC<Props> = ({ className }) => {
  const [lang1, setLang1] = useState("ja");
  const [lang2, setLang2] = useState("en");
  const [voice, setVoice] = useState("alloy");
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setLang1(getLang1());
    setLang2(getLang2());
    setVoice(getVoice());
  }, []);

  const infoValue = (value: string): string => {
    return isClient ? value : "loading...";
  };

  return (
    <div className={`flex items-center gap-12 text-sm ${className}`}>
      <div className="flex items-center gap-2">
        <span>{infoValue(lang1Map[lang1])}</span>
        <ArrowLeftRight className="h-4 w-4" />
        <span>{infoValue(lang2Map[lang2])}</span>
      </div>
      <span>voice: {infoValue(voiceMap[voice])}</span>
    </div>
  );
};

export default Component;
