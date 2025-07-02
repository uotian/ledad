"use client";

import { useEffect, useState, useRef } from "react";
import { getMessages } from "@/lib/storage";
import { Message } from "@/lib/types";
import NoMessage from "./no-message";
import MessageItem from "./message";

export default function Main() {
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const handleStorageChange = () => {
    setMessages(getMessages());
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
  return (
    <main className="pt-14 pb-20 h-[100vh] overflow-y-auto">
      {messages.length === 0 ? (
        <NoMessage className="container mx-auto p-4 h-full" />
      ) : (
        <div className="container mx-auto p-4 flex flex-col gap-4">
          {messages.map((message, index) => (
            <MessageItem key={index} message={message} />
          ))}
        </div>
      )}
      <div ref={messagesEndRef} />
    </main>
  );
}
