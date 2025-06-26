"use client";

import { useState } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { getLang1, getLang2, addMessage } from "@/app/local-storages";
import access from "@/app/api/translate/access";

export default function Input() {
  const [value, setValue] = useState("");
  const [valueTranslate, setValueTranslate] = useState("");
  const [valueBackup, setValueBackup] = useState("");
  const [composing, setComposing] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [saving, setSaving] = useState(false);

  const action = async (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const text = value.trim();
    if (text && e.key === "Enter" && !composing) {
      if (translating) {
        alert("翻訳中だから待てって");
      } else {
        if (!e.shiftKey) {
          setSaving(true);
        }
        let translated = valueTranslate;
        if (text != valueBackup) {
          setTranslating(true);
          try {
            const langFrom = getLang2();
            const langTo = getLang1();
            translated = await access({ text, langFrom, langTo }).catch(() => "翻訳失敗");
            setValueBackup(text);
          } catch (error) {
            translated = "[ERROR] 翻訳に失敗しました: " + error;
          } finally {
            setValueTranslate(translated);
            setTranslating(false);
          }
        }
        if (!e.shiftKey) {
          addMessage({ user: 1, text, translated: translated });
          setValue("");
          setValueTranslate("");
          setSaving(false);
        }
      }
    }
  };

  return (
    <div className="flex gap-4 w-full flex-row-reverse">
      <div className="absolute right-4 bottom-4">
        {translating ? (
          <Loader2 className="h-8 w-8 animate-spin text-red-800" />
        ) : (
          <AlertCircle className="h-8 w-8 text-blue-800" />
        )}
      </div>
      <Textarea
        placeholder="入力してください"
        className="flex-1 bg-white/75 disabled:bg-stone-300 disabled:opacity-80 min-h-24"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={action}
        onCompositionStart={() => setComposing(true)}
        onCompositionEnd={() => setComposing(false)}
        disabled={saving}
      />
      <Textarea
        placeholder="翻訳結果が入力されます"
        className="flex-1 bg-white/75 disabled:bg-stone-300 disabled:opacity-80 min-h-24"
        value={valueTranslate}
        readOnly
      />
      <div></div>
    </div>
  );
}
