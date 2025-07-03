"use client";

import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import speakApi from "@/apis/speak-api";
import { getVoice } from "@/lib/storage";
import { Loader2, Volume2, Square, Play, RotateCcw } from "lucide-react";

interface SpeakConfirmDialogProps {
  isOpen: boolean;
  text: string;
  onClose: () => void;
}

export const SpeakConfirmDialog = ({
  isOpen,
  text,
  onClose,
}: SpeakConfirmDialogProps) => {
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState<number>(-1);
  const [segments, setSegments] = useState<string[]>([]);
  const [loadingSegments, setLoadingSegments] = useState<Set<number>>(
    new Set()
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const currentSourceRef = useRef<AudioBufferSourceNode | null>(null);

  useEffect(() => {
    if (isOpen) {
      const textSegments = text
        .split("\n")
        .filter((segment) => segment.trim().length > 0);
      setSegments(textSegments);
      setCurrentSegmentIndex(-1);
      setLoadingSegments(new Set());
      setIsPlaying(false);
      // 自動開始（一時停止中でない時のみ）
      if (currentSegmentIndex === -1) {
        speak(text, 0);
      }
    } else {
      // ダイアログが閉じられた時に強制停止
      handleStop();
    }
  }, [isOpen, text]);

  const speak = async (text: string, startIndex: number = 0) => {
    try {
      setIsPlaying(true);
      abortControllerRef.current = new AbortController();
      const voice = getVoice();

      // テキストを改行で分割
      const segments = text
        .split("\n")
        .filter((segment) => segment.trim().length > 0);

      for (let i = startIndex; i < segments.length; i++) {
        // 停止チェック
        if (abortControllerRef.current?.signal.aborted) {
          break;
        }

        const segment = segments[i];
        setCurrentSegmentIndex(i);
        setLoadingSegments((prev) => new Set(prev).add(i));

        const response = await speakApi({ text: segment, voice });

        if (response && response.audio) {
          setLoadingSegments((prev) => {
            const newSet = new Set(prev);
            newSet.delete(i);
            return newSet;
          });

          // base64エンコードされたオーディオデータをデコード
          const audioData = atob(response.audio);
          const audioArray = new Uint8Array(audioData.length);
          for (let j = 0; j < audioData.length; j++) {
            audioArray[j] = audioData.charCodeAt(j);
          }

          // AudioContextを使用してオーディオを再生
          const audioContext = new (window.AudioContext ||
            (window as any).webkitAudioContext)();
          audioContextRef.current = audioContext;

          const audioBuffer = await audioContext.decodeAudioData(
            audioArray.buffer
          );
          const source = audioContext.createBufferSource();
          currentSourceRef.current = source;
          source.buffer = audioBuffer;
          source.connect(audioContext.destination);

          // 現在のセグメントの再生が完了するまで待機
          await new Promise<void>((resolve, reject) => {
            source.onended = () => resolve();

            // 停止チェックを定期的に行う
            const checkInterval = setInterval(() => {
              if (abortControllerRef.current?.signal.aborted) {
                clearInterval(checkInterval);
                source.stop();
                reject(new Error("Playback stopped"));
              }
            }, 100);

            source.start(0);
          }).catch((error: unknown) => {
            if (
              error instanceof Error &&
              error.message === "Playback stopped"
            ) {
              throw error; // 停止による中断は正常な動作
            }
            throw error;
          });
        }
      }
      // 正常終了時のみリセット
      setCurrentSegmentIndex(-1);
      setIsPlaying(false);
    } catch (error: unknown) {
      if (error instanceof Error && error.message !== "Playback stopped") {
        console.error("音声再生エラー:", error);
        // エラーの場合のみリセット
        setCurrentSegmentIndex(-1);
      }
      // 停止による中断の場合は位置を保持
      setLoadingSegments(new Set());
      setIsPlaying(false);
    }
  };

  const handleStop = () => {
    // AbortControllerで停止
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // 現在再生中のオーディオを停止
    if (currentSourceRef.current) {
      try {
        currentSourceRef.current.stop();
      } catch (error) {
        // 既に停止している場合は無視
      }
      currentSourceRef.current = null;
    }

    // AudioContextを停止
    if (audioContextRef.current) {
      try {
        audioContextRef.current.close();
      } catch (error) {
        // 既に閉じている場合は無視
      }
      audioContextRef.current = null;
    }

    setIsPlaying(false);
    // currentSegmentIndexは保持して再開位置を記憶
    setLoadingSegments(new Set());
  };

  const handleStart = () => {
    // 停止した位置から再開、または最初から開始
    const startIndex = currentSegmentIndex >= 0 ? currentSegmentIndex : 0;
    speak(text, startIndex);
  };

  const handleRestart = () => {
    // 最初から再開
    speak(text, 0);
  };

  const getSegmentIcon = (index: number) => {
    if (loadingSegments.has(index)) {
      return <Loader2 className="w-3 h-3 animate-spin text-blue-800" />;
    } else if (currentSegmentIndex === index) {
      return <Volume2 className="w-3 h-3 text-blue-800" />;
    }
    return null;
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          handleStop();
          onClose();
        }
      }}
    >
      <DialogContent className="!max-w-7xl">
        <DialogTitle className="sr-only">音声再生</DialogTitle>
        <div className="py-3 -mx-3 rounded text-sm">
          {segments.map((segment, index) => (
            <div
              key={index}
              className={`whitespace-pre-wrap py-0.5 pr-4 flex items-center gap-2 ${
                index === currentSegmentIndex && "text-blue-800"
              }`}
            >
              <div className="w-4">{getSegmentIcon(index)}</div>
              <div className="flex-1">{segment}</div>
            </div>
          ))}
        </div>
        <DialogFooter className="gap-2">
          <Button
            variant="default"
            onClick={handleStart}
            disabled={isPlaying}
            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400"
          >
            <Play className="w-4 h-4 fill-current" />
            {currentSegmentIndex >= 0 ? "RESUME" : "START"}
          </Button>
          <Button
            variant="outline"
            onClick={handleRestart}
            disabled={isPlaying}
            className="flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            RESTART
          </Button>
          <Button
            variant="destructive"
            onClick={handleStop}
            disabled={!isPlaying}
            className="flex items-center gap-2"
          >
            <Square className="w-4 h-4 fill-current" />
            STOP
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
