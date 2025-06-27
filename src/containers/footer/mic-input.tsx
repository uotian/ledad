"use client";

import { useState, useCallback } from "react";
import { Pause, Mic, Play } from "lucide-react";
import { getLang1, getLang2, addMessage, updateMessage } from "@/lib/storage";
import whisperAPI from "@/lib/whisper-api";
import translateAPI from "@/lib/translate-api";
import ButtonCircle from "@/components/myui/button-circle";

export default function MicInput() {
  const [recorder, setRecorder] = useState<MediaRecorder | null>(null);
  const [langFrom, langTo, user] = [getLang1(), getLang2(), 1];

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

  const start = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream, { mimeType: "audio/webm;codecs=opus" });
      let audio: Blob | null = null;
      mr.ondataavailable = (e) => (audio = e.data);
      mr.onstop = () => audio && convert(audio);
      mr.start();
      setRecorder(mr);
    } catch (err) {
      console.error("録音開始エラー:", err);
    }
  }, [convert]);

  const stop = useCallback(() => {
    if (recorder) {
      recorder.stop();
      recorder.stream.getTracks().forEach((track) => track.stop());
      setRecorder(null);
    }
  }, [recorder]);

  const send = useCallback(() => {
    if (recorder) {
      stop();
      start();
    }
  }, [recorder, stop, start]);

  return (
    <div className="relative">
      <div className="flex gap-3 xl:gap-6">
        <ButtonCircle
          variant="red"
          onClick={recorder ? stop : start}
          className={recorder ? "animate-pulse bg-red-600" : ""}
        >
          {recorder ? <Pause className="text-white fill-current" /> : <Mic className="text-white" />}
        </ButtonCircle>

        <ButtonCircle variant={recorder ? "blue" : "gray"} onClick={send} disabled={!recorder}>
          <Play className="text-white fill-current" />
        </ButtonCircle>
      </div>
    </div>
  );
}
