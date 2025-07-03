"use client";

import { useState, useRef } from "react";
import { Textarea } from "@/components/ui/textarea";
import { addMessage, updateMessage } from "@/lib/storage";
import translateAPI from "@/apis/translate-api";

interface Props {
  langFrom: string;
  langTo: string;
  user: string;
}

export default function TextInput({ langFrom, langTo, user }: Props) {
  const [value, setValue] = useState("");
  const [translated0, setTranslated0] = useState("");
  const [composing, setComposing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const text = value.trim();
    if (text && e.key === "Enter" && !composing) {
      if (e.shiftKey) {
        setTranslated0(
          translated0 ? translated0 + "\nTranslating..." : "Translating..."
        );
        const translated = await translateAPI({ text, langFrom, langTo });
        setTranslated0(translated);
      } else {
        e.preventDefault();
        setTranslated0(
          translated0
            ? translated0 + "\nTranslating and sending..."
            : "Translating and sending..."
        );
        const timestamp = Math.floor(Date.now() / 1000);
        const messageId = addMessage({
          user,
          timestamp,
          text,
          status: "translating",
        });
        setValue("");
        const translated = await translateAPI({ text, langFrom, langTo });
        updateMessage(messageId, { translated, status: "completed" });
        setTranslated0("");
        textareaRef.current?.focus();
      }
    }
  };

  return (
    <div className="flex flex-col lg:flex-row w-full">
      <div className="flex-1 bg-static2 text-static2 opacity-80 min-h-8 lg:min-h-16 px-3 py-2 border border-foreground/60 rounded-md border-b-0 lg:border-1 lg:border-r-0 rounded-b-none lg:rounded-xl lg:rounded-r-none overflow-y-auto text-xs lg:text-sm whitespace-pre-wrap">
        {translated0 || "Translated output"}
      </div>
      <Textarea
        ref={textareaRef}
        placeholder="Please input"
        className="flex-1 bg-static1 text-static1 opacity-80 placeholder:text-stone-700  min-h-8 lg:min-h-16 resize-none border border-foreground/60 lg:border-1 rounded-t-none lg:rounded-xl lg:rounded-l-none text-xs lg:text-sm "
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onCompositionStart={() => setComposing(true)}
        onCompositionEnd={() => setComposing(false)}
      />
    </div>
  );
}
