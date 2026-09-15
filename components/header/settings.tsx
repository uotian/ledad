"use client";

import { useState, type FormEvent } from "react";
import { SettingsIcon } from "lucide-react";
import type { Settings } from "@/lib/types";
import { Button } from "@/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/ui/dialog";
import { Label } from "@/ui/label";
import { Textarea } from "@/ui/textarea";

export function SettingsDialog({ settings, onSave }: { settings: Settings; onSave: (settings: Settings) => void }) {
  const [open, setOpen] = useState(false);
  const [prompt, setPrompt] = useState(settings.prompt);
  const [keywordsText, setKeywordsText] = useState(settings.keywords.join("\n"));
  const [error, setError] = useState<string | null>(null);

  function changeOpen(nextOpen: boolean) {
    if (nextOpen) {
      setPrompt(settings.prompt);
      setKeywordsText(settings.keywords.join("\n"));
      setError(null);
    }
    setOpen(nextOpen);
  }

  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const keywords = [...new Set(keywordsText.split(/\r?\n/).map((keyword) => keyword.trim()).filter(Boolean))];
    if (keywords.some((keyword) => /[<>\r\n]/.test(keyword))) {
      setError("Keywords cannot contain < or >.");
    } else {
      try {
        onSave({ prompt, keywords });
        setOpen(false);
      } catch {
        setError("Could not save settings in this browser.");
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={changeOpen}>
      <DialogTrigger render={<Button variant="ghost" size="icon" className="cursor-pointer" aria-label="Settings" />}>
        <SettingsIcon aria-hidden="true" />
      </DialogTrigger>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-xl">
        <form onSubmit={save} className="grid gap-5">
          <DialogHeader>
            <DialogTitle>Settings</DialogTitle>
            <DialogDescription>Saved in this browser. Changes apply when you start a session.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-2">
            <Label htmlFor="transcription-prompt">Prompt</Label>
            <Textarea id="transcription-prompt" value={prompt} onChange={(event) => setPrompt(event.target.value)} className="min-h-36" placeholder="Describe the topic or recording context." />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="transcription-keywords">Keywords</Label>
            <Textarea id="transcription-keywords" value={keywordsText} onChange={(event) => setKeywordsText(event.target.value)} className="min-h-28" aria-describedby="keywords-hint" placeholder={"OpenAI\nUnited Nations"} />
            <p id="keywords-hint" className="text-xs text-muted-foreground">One keyword per line. Names and acronyms help with spelling.</p>
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
