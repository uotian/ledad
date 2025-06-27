"use client";

import { useState, useCallback } from "react";
import { Mic, MicOff, Loader2 } from "lucide-react";
import { getLang1, getLang2, addMessage } from "@/app/local-storages";
import whisperAPI from "@/app/api/whisper/access";
import translateAPI from "@/app/api/translate/access";

export default function MicInput() {
  const [recorder, setRecorder] = useState<MediaRecorder | null>(null);
  const [converting, setConverting] = useState(false);

  const convert = useCallback(async (audio: Blob) => {
    setConverting(true);
    const langFrom = getLang1();
    const langTo = getLang2();
    const text = await whisperAPI({ audio, lang: langFrom }).catch(() => "音声認識失敗");
    const translated = await translateAPI({ text, langFrom, langTo }).catch(() => "翻訳失敗");
    if (text && text.trim()) {
      addMessage({ user: 1, text, translated });
    }
    setConverting(false);
  }, []);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const _recorder = new MediaRecorder(stream, { mimeType: "audio/webm;codecs=opus" });
      let audio: Blob | null = null;
      _recorder.ondataavailable = (e) => (audio = e.data);
      _recorder.onstop = () => audio && convert(audio);
      _recorder.start();
      setRecorder(_recorder);
    } catch (err) {
      console.error("録音開始エラー:", err);
    }
  }, [convert]);

  const stopRecording = useCallback(() => {
    if (recorder) {
      recorder.stop();
      recorder.stream.getTracks().forEach((track) => track.stop());
      setRecorder(null);
    }
  }, [recorder]);

  if (converting) {
    return (
      <button
        disabled
        className="h-16 w-16 rounded-full transition-all duration-200 flex items-center justify-center bg-gray-600"
      >
        <Loader2 className="h-8 w-8 text-white animate-spin" />
      </button>
    );
  } else if (recorder) {
    return (
      <button
        onClick={stopRecording}
        className="h-16 w-16 rounded-full transition-all duration-200 flex items-center justify-center bg-red-600 animate-pulse"
      >
        <MicOff className="h-8 w-8 text-white" />
      </button>
    );
  } else {
    return (
      <button
        onClick={startRecording}
        className="h-16 w-16 rounded-full transition-all duration-200 flex items-center justify-center bg-red-900 hover:bg-red-800"
      >
        <Mic className="h-8 w-8 text-white" />
      </button>
    );
  }
}
