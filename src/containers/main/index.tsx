"use client";

import { useEffect, useState, useRef } from "react";
import { getMessageMap } from "@/lib/storage";
import { Message } from "@/lib/types";
import NoMessage from "./no-message";
import MessageItem from "./message";

export default function Main() {
  const [messages, setMessageMap] = useState<Record<string, Message>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const handleStorageChange = () => {
    setMessageMap(getMessageMap());
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };
  useEffect(() => {
    handleStorageChange();
    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("messages", handleStorageChange);
    window.addEventListener("roomChange", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("messages", handleStorageChange);
      window.removeEventListener("roomChange", handleStorageChange);
    };
  }, []);
  const sortedMessages = Object.values(messages).sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime());
  return (
    <main className="pt-14 pb-20 h-[100vh] overflow-y-auto">
      {sortedMessages.length === 0 ? (
        <NoMessage className="container mx-auto p-4 h-full" />
      ) : (
        <div className="container mx-auto p-4 flex flex-col gap-4">
          {sortedMessages.map((message, index) => (
            <MessageItem key={index} message={message} />
          ))}
        </div>
      )}
      <div ref={messagesEndRef} />
    </main>
  );
}
