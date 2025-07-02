"use client";

import React, { useState, useEffect, useRef } from "react";
import { Textarea } from "@/components/ui/textarea";
import { sendChatMessage } from "@/apis/chat-api";
import { getMessages, getChatHistory, addChatHistory } from "@/lib/storage";
import { ChatHistory } from "@/lib/types";
import { MessageSquare, X } from "lucide-react";
import Markdown from "./markdown";
interface SidebarProps {
  setSidebarOpen: (open: boolean) => void;
}

export default function Sidebar({ setSidebarOpen }: SidebarProps) {
  const [value, setValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [composing, setComposing] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([]);
  const scrollEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const focusTextarea = () => {
    if (textareaRef.current) {
      // 少し遅延を入れて確実にフォーカスを戻す
      setTimeout(() => {
        const textarea = textareaRef.current;
        if (textarea) {
          textarea.focus();
          // カーソルを末尾に移動
          const length = textarea.value.length;
          textarea.setSelectionRange(length, length);
        }
      }, 100);
    }
  };

  // チャット履歴を読み込む
  useEffect(() => {
    setChatHistory(getChatHistory());
    // コンポーネントマウント時にフォーカスを設定
    setTimeout(() => {
      focusTextarea();
    }, 200);
  }, []);

  // ルーム変更時にチャット履歴を更新
  useEffect(() => {
    const handleRoomChange = () => {
      setChatHistory(getChatHistory());
    };

    window.addEventListener("roomChange", handleRoomChange);
    return () => {
      window.removeEventListener("roomChange", handleRoomChange);
    };
  }, []);

  // チャット履歴が更新された時にスクロール
  useEffect(() => {
    scrollToBottom();
  }, [chatHistory.length, isLoading]);

  const scrollToBottom = () => {
    scrollEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendChat = async (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const text = value.trim();
    if (text && e.key === "Enter" && !composing && !isLoading) {
      if (!e.shiftKey) {
        e.preventDefault();
        setIsLoading(true);
        try {
          // localStorageからメッセージを取得してソート
          const messages = getMessages();
          const result = await sendChatMessage(text, messages);
          console.log("result", result);
          scrollToBottom();

          // チャット履歴に保存
          addChatHistory(text, result.response);
          setChatHistory(getChatHistory());
        } catch (error) {
          console.error("Chat error:", error);
          const errorMessage = "An error occurred: " + (error as Error).message;

          // エラーも履歴に保存
          addChatHistory(text, errorMessage);
          setChatHistory(getChatHistory());
        } finally {
          setIsLoading(false);
          setValue("");
          // テキストエリアにフォーカスを戻す
          focusTextarea();
          scrollToBottom();
        }
      }
    }
  };

  const formatDateTime = (datetime: string) => {
    return new Date(datetime).toLocaleString("en-US", {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="relative flex flex-col h-full bg-sidebar text-sidebar-foreground">
      {/* ヘッダー - 上部固定 */}
      <button
        onClick={() => setSidebarOpen(false)}
        className="absolute top-2 right-2 p-2 rounded-md transition-colors cursor-pointer hover:opacity-80"
      >
        <X className="w-4 h-4" />
      </button>

      {/* チャット履歴 - スクロール可能エリア */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {chatHistory.length > 0 && (
          <div className="space-y-8">
            {chatHistory.map((chat) => (
              <div key={chat.id} className="">
                <div className="flex items-center gap-2 mb-2 text-xs text-muted-foreground">
                  <MessageSquare className="w-3 h-3 flex-shrink-0" />
                  {formatDateTime(chat.datetime)}
                </div>
                <div className="space-y-0 text-sm">
                  <div className="break-words mb-2">
                    <span className="font-medium text-primary">Question: </span>
                    <div className="whitespace-pre-wrap break-words">{chat.prompt}</div>
                  </div>
                  <div className="break-words">
                    <span className="font-medium text-secondary">Answer: </span>
                    <Markdown>{chat.response}</Markdown>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 回答中表示 */}
        {isLoading && (
          <div>
            <div className="flex items-center gap-2 mb-2 text-xs text-muted-foreground">
              <MessageSquare className="w-3 h-3 flex-shrink-0" />
              {formatDateTime(new Date().toISOString())}
            </div>
            <div className="space-y-0 text-sm">
              <div className="break-words mb-2">
                <span className="font-medium text-primary">Question: </span>
                <div className="whitespace-pre-wrap break-words">{value}</div>
              </div>
              <div className="break-words">
                <span className="font-medium text-secondary">Answer: </span>
                <div className="animate-pulse text-muted-foreground">Generating answer...</div>
              </div>
            </div>
          </div>
        )}

        {/* スクロール用の要素 */}
        <div ref={scrollEndRef} />
      </div>

      {/* 入力エリア - 下部固定 */}
      <div className="relative flex-shrink-0 px-6 mb-4">
        <Textarea
          ref={textareaRef}
          placeholder="Enter your question..."
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="w-full resize-none bg-white/60 dark:bg-white/60 text-sidebar dark:placeholder-sidebar/40 text-sm"
          onKeyDown={(e) => {
            handleSendChat(e);
          }}
          disabled={isLoading}
          onCompositionStart={() => setComposing(true)}
          onCompositionEnd={() => setComposing(false)}
        />
      </div>
      <div className="absolute bottom-6 right-8 text-right text-sidebar/80 text-xs">AI Anayzer</div>
    </div>
  );
}
