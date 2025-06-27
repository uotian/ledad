"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { getLang1, getLang2, addMessage, updateMessage } from "@/lib/storage";
import translateAPI from "@/lib/translate-api";

export default function Input() {
  const [value, setValue] = useState("");
  const [translated0, setTranslated0] = useState("");
  const [composing, setComposing] = useState(false);
  const [langFrom, langTo, user] = [getLang2(), getLang1(), 2];

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
    <div className="flex gap-3 xl:gap-6 w-full">
      <div className="flex-1 bg-stone-200/75 min-h-16 px-3 py-2 border rounded-md overflow-y-auto text-base md:text-sm whitespace-pre-wrap">
        {translated0 || "翻訳結果が確認できます"}
      </div>
      <Textarea
        placeholder="入力してください"
        className="flex-1 bg-white/75 min-h-16"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onCompositionStart={() => setComposing(true)}
        onCompositionEnd={() => setComposing(false)}
      />
    </div>
  );
}
