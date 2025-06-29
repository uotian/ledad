"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { addMessage, updateMessage } from "@/lib/storage";
import translateAPI from "@/lib/translate-api";

interface TextInputProps {
  langFrom: string;
  langTo: string;
  user: string;
}

export default function TextInput({ langFrom, langTo, user }: TextInputProps) {
  const [value, setValue] = useState("");
  const [translated0, setTranslated0] = useState("");
  const [composing, setComposing] = useState(false);

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const text = value.trim();
    if (text && e.key === "Enter" && !composing) {
      if (e.shiftKey) {
        setTranslated0(translated0 ? translated0 + "\n翻訳中..." : "翻訳中...");
        const translated = await translateAPI({ text, langFrom, langTo });
        setTranslated0(translated);
      } else {
        e.preventDefault();
        setTranslated0(translated0 ? translated0 + "\n翻訳し送信中..." : "翻訳し送信中...");
        const messageId = addMessage({ user, text, translated: "翻訳中..." });
        setValue("");
        const translated = await translateAPI({ text, langFrom, langTo });
        updateMessage(messageId, { translated, status: "success" });
        setTranslated0("");
      }
    }
  };

  return (
    <div className="flex flex-col md:flex-row w-full">
      <div className="flex-1 bg-muted/75 min-h-8 md:min-h-16 px-3 py-2 border border-foreground/60 rounded-md border-b-0 md:border-1 md:border-r-0 rounded-b-none md:rounded-xl md:rounded-r-none overflow-y-auto text-xs md:text-sm whitespace-pre-wrap">
        {translated0 || "翻訳結果が確認できます"}
      </div>
      <Textarea
        placeholder="入力してください"
        className="flex-1 bg-input/75 min-h-8 md:min-h-16 resize-none border border-foreground/60 border-t-0 md:border-1 md:border-l-0 rounded-t-none md:rounded-xl md:rounded-l-none text-xs md:text-sm "
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onCompositionStart={() => setComposing(true)}
        onCompositionEnd={() => setComposing(false)}
      />
    </div>
  );
}
