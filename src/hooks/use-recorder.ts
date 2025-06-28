import { useState, useCallback, useRef, useEffect } from "react";

// 録音関連のロジックをカスタムフックとして切り出し
export function useRecorder(convert: (audio: Blob) => Promise<void>) {
  const [recorder, setRecorder] = useState<MediaRecorder | null>(null);
  const [count, setCount] = useState<number>(0);
  const timeout = useRef<NodeJS.Timeout | null>(null);
  const interval = useRef<NodeJS.Timeout | null>(null);

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
    clearTimer();
  }, [recorder, clearTimer]);

  const send = useCallback(() => {
    if (recorder) {
      stop();
      start();
    }
  }, [recorder, stop, start]);

  // 10秒後に自動送信
  useEffect(() => {
    if (recorder) {
      const countMax = 60;
      clearTimer();
      setCount(countMax);

      interval.current = setInterval(() => {
        setCount((prev) => {
          if (prev <= 1) clearInterval(interval.current!);
          return prev - 1;
        });
      }, 1000);

      timeout.current = setTimeout(() => send(), countMax * 1000);
    }
    return () => clearTimer();
  }, [recorder, send, clearTimer]);

  return { recorder, count, start, stop, send };
}
