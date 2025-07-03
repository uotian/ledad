"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Volume2 } from "lucide-react";
import { SpeakConfirmDialog } from "./dialog";

interface SpeakerButtonProps {
  text: string;
}

export const SpeakerButton = ({ text }: SpeakerButtonProps) => {
  const [speakDialog, setSpeakDialog] = useState(false);

  const handleSpeakClick = () => {
    setSpeakDialog(true);
  };

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleSpeakClick}
        className="p-1 h-auto cursor-pointer"
        title="音声で読み上げ"
      >
        <Volume2 className="h-4 w-4" />
      </Button>

      <SpeakConfirmDialog
        isOpen={speakDialog}
        text={text}
        onClose={() => setSpeakDialog(false)}
      />
    </>
  );
};
