"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import RadioGroupNeo from "@/components/myui/radio-group-neo";
import { langAMap, langBMap, voiceMap, mainUserMap, intervalSecMap } from "@/lib/storage";
import { getLangA, getLangB, getVoice, getMainUser, getIntervalSec } from "@/lib/storage";
import { setLangA, setLangB, setVoice, setMainUser, setIntervalSec } from "@/lib/storage";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function SettingDialog({ open, onOpenChange }: Props) {
  const [langA, setLangAState] = useState(Object.keys(langAMap)[0]);
  const [langB, setLangBState] = useState(Object.keys(langBMap)[0]);
  const [voice, setVoiceState] = useState("alloy");
  const [mainUser, setMainUserState] = useState("B");
  const [intervalSec, setIntervalSecState] = useState("60");

  useEffect(() => {
    setLangAState(getLangA());
    setLangBState(getLangB());
    setVoiceState(getVoice());
    setMainUserState(getMainUser());
    setIntervalSecState(getIntervalSec().toString());
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLangA(langA);
    setLangB(langB);
    setVoice(voice);
    setMainUser(mainUser);
    setIntervalSec(intervalSec);
    window.location.reload();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`w-full p-6 rounded-lg shadow-lg`}>
        <DialogHeader className="mb-4">
          <DialogTitle>設定</DialogTitle>
        </DialogHeader>

        <form className="flex flex-col gap-8" onSubmit={handleSubmit}>
          <RadioGroupNeo name="Aの言語" valueMap={langAMap} defaultValue={langA} onValueChange={setLangAState} />
          <RadioGroupNeo name="Bの言語" valueMap={langBMap} defaultValue={langB} onValueChange={setLangBState} />
          <RadioGroupNeo name="メインユーザー" valueMap={mainUserMap} defaultValue={mainUser} onValueChange={setMainUserState} />
          <RadioGroupNeo name="Voice" valueMap={voiceMap} defaultValue={voice} onValueChange={setVoiceState} />
          <RadioGroupNeo name="自動送信間隔" valueMap={intervalSecMap} defaultValue={intervalSec} onValueChange={setIntervalSecState} />

          <DialogFooter className="flex items-center gap-2 mt-4">
            <div className="flex-1" />
            <DialogClose asChild>
              <Button type="submit" className="cursor-pointer">
                保存
              </Button>
            </DialogClose>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
