"use client";

import { useEffect, useState, useRef } from "react";
import { getMessages, Message } from "@/app/local-storages";
import NoData from "./nodata";
import MessageItem from "./message";

export default function Main() {
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const handleStorageChange = () => {
      setMessages(getMessages());
      // 少し遅延させてスクロール（DOMのレンダリングを待つ）
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    };

    handleStorageChange();
    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("messages", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("messages", handleStorageChange);
    };
  }, []);

  return (
    <main className="pt-20 pb-28 h-[100vh] overflow-y-auto">
      <div className="container mx-auto p-4">
        <div className="flex flex-col gap-4">
          {messages.length === 0 ? (
            <NoData />
          ) : (
            messages.map((message, index) => <MessageItem key={index} message={message} index={index} />)
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
    </main>
  );
}
