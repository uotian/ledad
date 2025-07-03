"use client";

import { useState, useRef } from "react";
import { Square, MessageSquarePlus as Add, Circle } from "lucide-react";
import { useTimer } from "react-timer-hook";
import {
  addMessage,
  updateMessage,
  replaceMessage,
  getIntervalSec1,
  getIntervalSec2,
} from "@/lib/storage";
// import convertAPI from "@/apis/transcrible-mini-api";
import convertAPI from "@/apis/transcrible-api";
// import convertAPI from "@/apis/whisper-api";
import translateAPI from "@/apis/translate-api";
import { Recorder } from "@/lib/recorder";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Props {
  langFrom: string;
  langTo: string;
  user: string;
}

export default function MicInput({ langFrom, langTo, user }: Props) {
  const [recorder1, setRecorder1] = useState<Recorder | null>(null);
  const [recorder2, setRecorder2] = useState<Recorder | null>(null);
  const timestamp = useRef<number>(0);
  const messageId = useRef<string | null>(null);

  const convert1 = (audio: Blob, messageId: string, timestamp: number) => {
    console.log("速報アップ", messageId, timestamp);
    updateMessage(messageId, { status: "converting" });
    convertAPI(timestamp, { audio, lang: langFrom })
      .then((results) => {
        const text = results.map((result) => result.text).join("\n");
        if (text.trim()) {
          updateMessage(messageId, { text, status: "translating" });
          translateAPI({ text, langFrom, langTo })
            .then((translated) =>
              updateMessage(messageId, { translated, status: "success" })
            )
            .catch(() =>
              updateMessage(messageId, { status: "translating error" })
            );
          console.log("速報アップ完了", messageId, timestamp);
        } else {
          updateMessage(messageId, { status: "converting error" });
        }
      })
      .catch(() => updateMessage(messageId, { status: "converting error" }));
  };

  const convert2 = (audio: Blob, messageId: string, timestamp: number) => {
    console.log("最終結果のアップロードです！！！！！", messageId, timestamp);
    convertAPI(timestamp, { audio, lang: langFrom }).then((results) => {
      const text = results.map((result) => result.text).join("\n");
      if (text.trim()) {
        translateAPI({ text, langFrom, langTo }).then((translated) => {
          replaceMessage(messageId, { text, translated, status: "completed" });
        });
        console.log("最終結果のアップ完了", messageId, timestamp);
      }
    });
  };

  const restart = () => {
    stop();
    setTimeout(() => {
      start();
    }, 0);
  };

  const expire = () => {
    const currentMessageId = messageId.current;
    const currentTimestamp = timestamp.current;
    if (timer1.isRunning) timer1.pause();
    if (recorder1) {
      recorder1
        .stop()
        .then((audio) => convert1(audio, currentMessageId!, currentTimestamp))
        .catch((error) => console.error("stopエラー:", error))
        .finally(() => setRecorder1(null));
    }
    setTimeout(() => {
      const start_timestamp = Math.floor(Date.now() / 1000);
      setTimeout(() => {
        if (
          timer2.isRunning &&
          timer2.minutes * 60 + timer2.seconds > getIntervalSec1()
        ) {
          timer1.restart(
            new Date((start_timestamp + getIntervalSec1()) * 1000)
          );
        }
      }, 0);
      const newRecorder = new Recorder(`mic-${langFrom}-${langTo}`);
      newRecorder
        .start()
        .then(() => setRecorder1(newRecorder))
        .catch((error) => console.error("startエラー:", error));
    }, 0);
  };

  const stop = () => {
    const currentMessageId = messageId.current;
    const currentTimestamp = timestamp.current;
    if (timer1.isRunning) timer1.pause();
    if (recorder1) {
      recorder1.stop().finally(() => setRecorder1(null));
    }
    if (timer2.isRunning) timer2.pause();
    if (recorder2) {
      recorder2
        .stop()
        .then((audio) => convert2(audio, currentMessageId!, currentTimestamp))
        .catch((error) => console.error("stopエラー:", error))
        .finally(() => setRecorder2(null));
    }
  };

  const start = () => {
    const start_timestamp = Math.floor(Date.now() / 1000);
    timestamp.current = start_timestamp;
    messageId.current = addMessage({
      user,
      timestamp: start_timestamp,
      status: "recording",
    });

    // setTimerでtimer.restartを安定化させる
    setTimeout(() => {
      timer1.restart(new Date((start_timestamp + getIntervalSec1()) * 1000));
      timer2.restart(new Date((start_timestamp + getIntervalSec2()) * 1000));
    }, 0);

    const newRecorder1 = new Recorder(`mic-${langFrom}-${langTo}`);
    newRecorder1
      .start()
      .then(() => setRecorder1(newRecorder1))
      .catch((error) => console.error("startエラー:", error));
    const newRecorder2 = new Recorder(`mic-${langFrom}-${langTo}`);
    newRecorder2
      .start()
      .then(() => setRecorder2(newRecorder2))
      .catch((error) => console.error("startエラー:", error));
  };

  const timer1 = useTimer({
    expiryTimestamp: new Date(
      (Math.floor(Date.now() / 1000) + getIntervalSec1()) * 1000
    ),
    onExpire: expire,
    autoStart: false,
  });

  const timer2 = useTimer({
    expiryTimestamp: new Date(
      (Math.floor(Date.now() / 1000) + getIntervalSec2()) * 1000
    ),
    onExpire: stop,
    autoStart: false,
  });

  const baseClasses =
    "h-10 w-10 lg:h-12 lg:w-12 border border-foreground/60 relative flex items-center justify-center opacity-60 text-white";

  return (
    <div className="flex">
      <div
        onClick={stop}
        className={cn(
          baseClasses,
          "flex-col rounded-l-md lg:rounded-l-xl border-x-0 bg-foreground text-background pl-1 font-bold"
        )}
      >
        <div className="text-base lg:text-xl">{user}</div>
        <div className="text-2xs lg:text-xs font-normal -mt-1">{langFrom}</div>
      </div>
      <div
        onClick={recorder2 ? stop : start}
        className={cn(
          baseClasses,
          " bg-red-800 cursor-pointer border-x-0",
          recorder2 && "animate-pulse"
        )}
      >
        {recorder2 ? (
          <Square className="fill-current w-3 lg:w-4 h-3 lg:h-4" />
        ) : (
          <Circle className="text-white w-3 lg:w-4 h-3 lg:h-4 fill-current" />
        )}
      </div>
      <div
        onClick={restart}
        className={cn(
          baseClasses,
          "rounded-r-md lg:rounded-r-xl border-l-0 ",
          recorder2
            ? "bg-blue-800 cursor-pointer"
            : "bg-muted cursor-not-allowed"
        )}
      >
        <Add className="w-4 lg:w-5 h-4 lg:h-5" strokeWidth={3} />
        {timer2.isRunning && (timer2.seconds > 0 || timer2.minutes > 0) && (
          <Badge
            variant="destructive"
            className="absolute -bottom-2 -right-2 rounded-full w-6 h-6 border border-foreground/60"
          >
            {timer2.minutes * 60 + timer2.seconds}
          </Badge>
        )}
      </div>
    </div>
  );
}
