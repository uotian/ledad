"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { getIntervalSec } from "@/lib/storage";

// 録音関連のロジックをカスタムフックとして切り出し
export function useRecorder(convert: (audio: Blob) => Promise<void>) {
  const [recorder, setRecorder] = useState<MediaRecorder | null>(null);
  const [count, setCount] = useState<number>(0);
  const timeout = useRef<NodeJS.Timeout | null>(null);
  const interval = useRef<NodeJS.Timeout | null>(null);
  const chunks = useRef<Blob[]>([]);

  const clearTimer = useCallback(() => {
    if (timeout.current) {
      clearTimeout(timeout.current);
      timeout.current = null;
    }
    if (interval.current) {
      clearInterval(interval.current);
      interval.current = null;
    }
    setCount(0);
  }, []);

  const start = useCallback(async () => {
    try {
      const mr = new MediaRecorder(await navigator.mediaDevices.getUserMedia({ audio: true }), { mimeType: "audio/webm;codecs=opus" });
      chunks.current = [];
      mr.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.current.push(e.data);
      };
      mr.onstop = () => {
        if (chunks.current.length > 0) convert(new Blob(chunks.current, { type: "audio/webm;codecs=opus" }));
        chunks.current = [];
      };
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
    clearTimer();
  }, [recorder, clearTimer]);

  const send = useCallback(() => {
    if (recorder) {
      stop();
      start();
    }
  }, [recorder, stop, start]);

  // localStorageから設定された間隔で自動送信
  useEffect(() => {
    if (recorder) {
      const intervalSec = getIntervalSec();
      clearTimer();
      setCount(intervalSec);

      interval.current = setInterval(() => {
        setCount((prev) => {
          if (prev <= 1) clearInterval(interval.current!);
          return prev - 1;
        });
      }, 1000);

      timeout.current = setTimeout(() => send(), intervalSec * 1000);
    }
    return () => clearTimer();
  }, [recorder, send, clearTimer]);

  return { recorder, count, start, stop, send };
}
