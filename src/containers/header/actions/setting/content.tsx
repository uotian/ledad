"use client";

import React, { useState } from "react";
import { DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import RadioGroupNeo from "@/components/myui/radio-group-neo";
import { lang1Map, lang2Map, voiceMap } from "@/lib/storage";
import { getLang1, getLang2, getVoice } from "@/lib/storage";
import { setLang1, setLang2, setVoice } from "@/lib/storage";

interface Props {
  className?: string;
}

const Component: React.FC<Props> = ({ className }) => {
  // 設定値の状態管理（localStorageから初期値を読み込み）
  const [lang1, setLang1State] = useState(() => getLang1());
  const [lang2, setLang2State] = useState(() => getLang2());
  const [voice, setVoiceState] = useState(() => getVoice());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLang1(lang1);
    setLang2(lang2);
    setVoice(voice);
    alert("保存しました");
    window.location.reload();
  };

  return (
    <DialogContent className={`max-w-md w-full p-6 rounded-lg shadow-lg ${className}`}>
      <DialogHeader className="mb-4">
        <DialogTitle>設定</DialogTitle>
      </DialogHeader>

      <form className="flex flex-col gap-8" onSubmit={handleSubmit}>
        <RadioGroupNeo name="相手の言語" valueMap={lang1Map} defaultValue={lang1} onValueChange={setLang1State} />
        <RadioGroupNeo name="あなたの言語" valueMap={lang2Map} defaultValue={lang2} onValueChange={setLang2State} />
        <RadioGroupNeo name="あなたの声" valueMap={voiceMap} defaultValue={voice} onValueChange={setVoiceState} />

        <DialogFooter className="flex items-center gap-2 mt-4">
          <div className="flex-1" />
          <DialogClose asChild>
            <Button type="submit">保存</Button>
          </DialogClose>
        </DialogFooter>
      </form>
    </DialogContent>
  );
};

export default Component;
