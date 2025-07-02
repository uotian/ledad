"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import RadioGroupNeo from "@/components/myui/radio-group-neo";
import { langAMap, langBMap, voiceMap, mainUserMap, intervalSecMap1, intervalSecMap2 } from "@/lib/storage";
import { getLangA, getLangB, getVoice, getMainUser, getIntervalSec1, getIntervalSec2 } from "@/lib/storage";
import { setLangA, setLangB, setVoice, setMainUser, setIntervalSec1, setIntervalSec2 } from "@/lib/storage";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function SettingDialog({ open, onOpenChange }: Props) {
  const [langA, setLangAState] = useState(Object.keys(langAMap)[0]);
  const [langB, setLangBState] = useState(Object.keys(langBMap)[0]);
  const [voice, setVoiceState] = useState("alloy");
  const [mainUser, setMainUserState] = useState("B");
  const [intervalSec1, setIntervalSecState1] = useState("60");
  const [intervalSec2, setIntervalSecState2] = useState("60");

  useEffect(() => {
    setLangAState(getLangA());
    setLangBState(getLangB());
    setVoiceState(getVoice());
    setMainUserState(getMainUser());
    setIntervalSecState1(getIntervalSec1().toString());
    setIntervalSecState2(getIntervalSec2().toString());
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLangA(langA);
    setLangB(langB);
    setVoice(voice);
    setMainUser(mainUser);
    setIntervalSec1(intervalSec1);
    setIntervalSec2(intervalSec2);
    window.location.reload();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`w-full p-6 rounded-lg shadow-lg`} style={{ maxWidth: "85vw", width: "85vw" }}>
        <DialogHeader className="mb-4">
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            You can change language settings, voice settings, auto-send intervals, and other application preferences.
          </DialogDescription>
        </DialogHeader>

        <form className="flex flex-col gap-8" onSubmit={handleSubmit}>
          <div className="flex gap-24">
            <RadioGroupNeo name="Main User" valueMap={mainUserMap} defaultValue={mainUser} onValueChange={setMainUserState} />
            <RadioGroupNeo name="User A Language" valueMap={langAMap} defaultValue={langA} onValueChange={setLangAState} />
            <RadioGroupNeo name="User B Language" valueMap={langBMap} defaultValue={langB} onValueChange={setLangBState} />
          </div>
          <div className="flex gap-24">
            <RadioGroupNeo
              name="Recording Interval (Fast)"
              valueMap={intervalSecMap1}
              defaultValue={intervalSec1}
              onValueChange={setIntervalSecState1}
            />
            <RadioGroupNeo
              name="Recording Interval (Max)"
              valueMap={intervalSecMap2}
              defaultValue={intervalSec2}
              onValueChange={setIntervalSecState2}
            />
          </div>
          <RadioGroupNeo name="Voice" valueMap={voiceMap} defaultValue={voice} onValueChange={setVoiceState} />

          <DialogFooter className="flex items-center gap-2 mt-4">
            <div className="flex-1" />
            <DialogClose asChild>
              <Button type="submit" className="cursor-pointer">
                Save
              </Button>
            </DialogClose>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
