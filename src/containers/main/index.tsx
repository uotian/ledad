"use client";

import { useEffect, useState, useRef } from "react";
import { getMessages, Message } from "@/lib/storage";
import NoMessage from "./no-message";
import MessageItem from "./message";

export default function Main() {
  const [messages, setMessages] = useState<Record<string, Message>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const handleStorageChange = () => {
      setMessages(getMessages());
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

  const sortedMessages = Object.values(messages).sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime());

  return (
    <main className="pt-14 pb-20 h-[100vh] overflow-y-auto">
      {sortedMessages.length === 0 ? (
        <div className="container mx-auto p-4 h-full">
          <NoMessage />
        </div>
      ) : (
        <div className="container mx-auto p-4">
          <div className="flex flex-col gap-4">
            {sortedMessages.map((message, index) => (
              <MessageItem key={index} message={message} />
            ))}
          </div>
        </div>
      )}
      <div ref={messagesEndRef} />
    </main>
  );
}
