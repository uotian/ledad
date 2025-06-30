"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { getIntervalSec } from "@/lib/storage";

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
      console.log("chunks.current.length(0)", chunks.current.length);
      console.log("chunks.current.length(0)", "---------");
      chunks.current = [];
      console.log("chunks.current.length(1)", chunks.current.length);
      const mr = new MediaRecorder(await navigator.mediaDevices.getUserMedia({ audio: true }), { mimeType: "audio/webm;codecs=opus" });
      mr.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.current.push(e.data);
      };
      mr.onstop = () => {
        console.log("chunks.current.length(2)", chunks.current.length);
        if (chunks.current.length > 0) convert(new Blob(chunks.current, { type: "audio/webm;codecs=opus" }));
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
