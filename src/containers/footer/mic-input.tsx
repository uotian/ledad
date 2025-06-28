"use client";

import { useCallback } from "react";
import { Pause, Mic, MessageCirclePlus } from "lucide-react";
import { addMessage, updateMessage } from "@/lib/storage";
import whisperAPI from "@/lib/whisper-api";
import translateAPI from "@/lib/translate-api";
import ButtonCircle from "@/components/myui/button-circle";
import { Badge } from "@/components/ui/badge";
import { useRecorder } from "@/hooks/use-recorder";

interface MicInputProps {
  langFrom: string;
  langTo: string;
  user: number;
}

export default function MicInput({ langFrom, langTo, user }: MicInputProps) {
  const convert = useCallback(
    async (audio: Blob) => {
      try {
        const messageId = addMessage({ user, text: "音声認識中..." });
        const text = await whisperAPI({ audio, lang: langFrom });
        if (text.trim()) {
          updateMessage(messageId, { text, translated: "翻訳中...", status: "processing" });
          const translated = await translateAPI({ text, langFrom, langTo });
          updateMessage(messageId, { translated, status: "success" });
        } else {
          updateMessage(messageId, { text: "音声認識に問題がありました", status: "error" });
        }
      } catch (error) {
        console.error("convertエラー:", error);
      }
    },
    [langFrom, langTo, user]
  );

  const { recorder, count, start, stop, send } = useRecorder(convert);

  return (
    <div className="relative">
      <div className="flex gap-3 xl:gap-6">
        <ButtonCircle
          variant="destructive"
          onClick={recorder ? stop : start}
          className={recorder ? "animate-pulse relative" : ""}
        >
          {recorder ? (
            <>
              <Pause className="text-white fill-current" />
              <Badge variant="destructive" className="absolute -top-2 -right-2 rounded-full w-6 h-6">
                {count}
              </Badge>
            </>
          ) : (
            <Mic className="text-white" />
          )}
        </ButtonCircle>

        <ButtonCircle variant={recorder ? "secondary" : "muted"} onClick={send} disabled={!recorder}>
          <MessageCirclePlus className="text-white" />
        </ButtonCircle>
      </div>
    </div>
  );
}
