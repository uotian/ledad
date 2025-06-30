"use client";

import { useCallback } from "react";
import { Square, MessageSquarePlus as Add, Circle } from "lucide-react";
import { addMessage, updateMessage } from "@/lib/storage";
import transcribleAPI from "@/apis/transcrible-api";
import translateAPI from "@/apis/translate-api";

import { Badge } from "@/components/ui/badge";
import { useRecorder } from "@/hooks/use-recorder";
import { cn } from "@/lib/utils";

interface Props {
  langFrom: string;
  langTo: string;
  user: string;
}

export default function MicInput({ langFrom, langTo, user }: Props) {
  const convert = useCallback(
    async (audio: Blob) => {
      try {
        const messageId = addMessage({ user, text: "音声認識中..." });
        const text = await transcribleAPI({ audio, lang: langFrom });
        if (text.trim()) {
          updateMessage(messageId, { text, translated: "翻訳中...", status: "translating" });
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

  const baseClasses = "h-8 w-8 lg:h-12 lg:w-12 border border-foreground/60 relative flex items-center justify-center opacity-60 text-white";

  return (
    <div className="flex">
      <div onClick={stop} className={cn(baseClasses, "rounded-l-xl border-x-0 bg-foreground pl-1 font-bold")}>
        <span className="text-xs lg:text-sm">{langFrom.toUpperCase()}</span>
      </div>
      <div onClick={recorder ? stop : start} className={cn(baseClasses, " bg-red-800 cursor-pointer border-x-0", recorder && "animate-pulse")}>
        {recorder ? <Square className="fill-current w-3 lg:w-4 h-3 lg:h-4" /> : <Circle className="text-white w-3 lg:w-4 h-3 lg:h-4 fill-current" />}
      </div>
      <div
        onClick={send}
        className={cn(baseClasses, "rounded-r-xl border-l-0 ", recorder ? "bg-blue-800 cursor-pointer" : "bg-muted cursor-not-allowed")}
      >
        <Add className="w-4 lg:w-5 h-4 lg:h-5" strokeWidth={3} />
        {count > 0 && (
          <Badge variant="destructive" className="absolute -top-2 -right-2 rounded-full w-6 h-6 border border-foreground/60">
            {count}
          </Badge>
        )}
      </div>
    </div>
  );
}
