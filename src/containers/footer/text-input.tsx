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
        setTranslated0(translated0 ? translated0 + "\nTranslating..." : "Translating...");
        const translated = await translateAPI({ text, langFrom, langTo });
        setTranslated0(translated);
      } else {
        e.preventDefault();
        setTranslated0(translated0 ? translated0 + "\nTranslating and sending..." : "Translating and sending...");
        const timestamp = Math.floor(Date.now() / 1000);
        const messageId = addMessage({ user, timestamp, text, status: "translating" });
        setValue("");
        const translated = await translateAPI({ text, langFrom, langTo });
        updateMessage(messageId, { translated, status: "completed" });
        setTranslated0("");
        textareaRef.current?.focus();
      }
    }
  };

  return (
    <div className="flex flex-col md:flex-row w-full">
      <div className="flex-1 bg-muted/60 min-h-8 md:min-h-16 px-3 py-2 border border-foreground/60 rounded-md border-b-0 md:border-1 md:border-r-0 rounded-b-none md:rounded-xl md:rounded-r-none overflow-y-auto text-xs md:text-sm whitespace-pre-wrap">
        {translated0 || "Translation result can be checked"}
      </div>
      <Textarea
        ref={textareaRef}
        placeholder="Please input"
        className="flex-1 bg-white/60 min-h-8 md:min-h-16 resize-none border border-foreground/60 md:border-1 rounded-t-none md:rounded-xl md:rounded-l-none text-xs md:text-sm "
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onCompositionStart={() => setComposing(true)}
        onCompositionEnd={() => setComposing(false)}
      />
    </div>
  );
}
