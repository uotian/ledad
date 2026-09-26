"use client";

import { useState, type FormEvent } from "react";
import { SettingsIcon } from "lucide-react";
import type { Session } from "@/hooks/use-session";
import { useSettings } from "@/hooks/use-settings";
import { LANGS, TEXT_SIZES, TRANSCRIPTION_PROVIDERS, type Lang, type TextSize, type TranscriptionProvider } from "@/lib/types";
import { Button } from "@/ui/button";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/ui/dialog";
import { Label } from "@/ui/label";
import { Textarea } from "@/ui/textarea";

export function SettingsDialog({ session }: { session: Pick<Session, "status" | "stop"> }) {
  const { settings, saveSettings } = useSettings();
  const [open, setOpen] = useState(false);
  const [textSize, setTextSize] = useState(settings.textSize);
  const [provider, setProvider] = useState(settings.provider);
  const [langFrom, setLangFrom] = useState(settings.langFrom);
  const [langTo, setLangTo] = useState(settings.langTo);
  const [prompt, setPrompt] = useState(settings.prompt);
  const [keywordsText, setKeywordsText] = useState(settings.keywords.join("\n"));
  const [error, setError] = useState<string | null>(null);

  function changeOpen(nextOpen: boolean) {
    if (nextOpen) {
      if (session.status !== "idle") {
        if (!window.confirm("Stop the current session and open settings?")) return;
        session.stop();
      }
      setTextSize(settings.textSize);
      setProvider(settings.provider);
      setLangFrom(settings.langFrom);
      setLangTo(settings.langTo);
      setPrompt(settings.prompt);
      setKeywordsText(settings.keywords.join("\n"));
      setError(null);
    }
    setOpen(nextOpen);
  }

  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const keywords = [...new Set(keywordsText.split(/\r?\n/).map((keyword) => keyword.trim()).filter(Boolean))];
    if (langFrom === langTo) {
      setError("Source and translation languages must be different.");
    } else if (keywords.some((keyword) => /[<>\r\n]/.test(keyword))) {
      setError("Keywords cannot contain < or >.");
    } else {
      try {
        saveSettings({ provider, textSize, langFrom, langTo, prompt, keywords });
        setOpen(false);
      } catch {
        setError("Could not save settings in this browser.");
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={changeOpen}>
      <DialogTrigger render={<Button variant="ghost" size="icon" className="cursor-pointer rounded-full" aria-label="Settings" />}>
        <SettingsIcon aria-hidden="true" />
      </DialogTrigger>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-xl">
        <form onSubmit={save} className="grid gap-5">
          <DialogHeader>
            <DialogTitle>Settings</DialogTitle>
          </DialogHeader>
          <div className="grid gap-2">
            <Label htmlFor="transcription-provider">Transcription</Label>
            <select id="transcription-provider" value={provider} onChange={(event) => setProvider(event.target.value as TranscriptionProvider)} className="h-9 w-full cursor-pointer rounded-md border border-input bg-background px-3 text-sm">
              {TRANSCRIPTION_PROVIDERS.map((provider) => <option key={provider} value={provider}>OpenAI</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="lang-from">Source language</Label>
              <select id="lang-from" value={langFrom} onChange={(event) => setLangFrom(event.target.value as Lang)} className="h-9 w-full cursor-pointer rounded-md border border-input bg-background px-3 text-sm">
                {LANGS.map((lang) => <option key={lang} value={lang}>{lang}</option>)}
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="lang-to">Translation language</Label>
              <select id="lang-to" value={langTo} onChange={(event) => setLangTo(event.target.value as Lang)} className="h-9 w-full cursor-pointer rounded-md border border-input bg-background px-3 text-sm">
                {LANGS.map((lang) => <option key={lang} value={lang}>{lang}</option>)}
              </select>
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="main-panel-text-size">Text size</Label>
            <select id="main-panel-text-size" value={textSize} onChange={(event) => setTextSize(event.target.value as TextSize)} className="h-9 w-full cursor-pointer rounded-md border border-input bg-background px-3 text-sm">
              {TEXT_SIZES.map((size) => <option key={size} value={size}>{size}</option>)}
            </select>
          </div>
          {provider === "openai" && <div className="grid gap-2">
            <Label htmlFor="transcription-prompt">Prompt</Label>
            <Textarea id="transcription-prompt" value={prompt} onChange={(event) => setPrompt(event.target.value)} className="min-h-36" placeholder="Describe the topic or recording context." />
          </div>}
          <div className="grid gap-2">
            <Label htmlFor="transcription-keywords">Keywords</Label>
            <Textarea id="transcription-keywords" value={keywordsText} onChange={(event) => setKeywordsText(event.target.value)} className="min-h-28" placeholder={"OpenAI\nUnited Nations"} />
          </div>
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
            <Button type="submit">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
