import { ArrowRight } from "lucide-react";
import type { LangState } from "@/hooks/use-lang";
import type { Session } from "@/hooks/use-session";
import { Button } from "@/ui/button";
import { LANGS, type Lang } from "@/lib/types";
import { cn } from "@/lib/utils";

export function LangSwitch({ lang, session }: { lang: LangState; session: Session }) {
  const disabled = session.status !== "idle";

  return (
    <div className="flex items-center gap-2">
      <SelectLang
        className="text-white/58 hover:text-white/88"
        label="LangFrom"
        disabled={disabled}
        value={lang.langFrom}
        onChange={(value) => lang.setLangFrom(value)}
      />
      <SwapLangs
        className="text-white/50 hover:text-white/80"
        disabled={disabled}
        label="Swap Langs"
        onClick={lang.swapLangs}
      />
      <SelectLang
        className="text-white/58 hover:text-white/88"
        label="LangTo"
        disabled={disabled}
        value={lang.langTo}
        onChange={(value) => lang.setLangTo(value)}
      />
    </div>
  );
}

function SelectLang({ className, label, disabled, onChange, value }: { className?: string; label: string; disabled: boolean; onChange: (value: Lang) => void; value: Lang }) {
  return (
    <select
      aria-label={label}
      className={cn("bg-transparent cursor-pointer text-sm outline-none disabled:cursor-not-allowed disabled:opacity-50", className)}
      disabled={disabled}
      value={value}
      onChange={(event) => onChange(event.target.value as Lang)}
    >
      {LANGS.map((lang) => (
        <option key={lang} value={lang}>
          {lang}
        </option>
      ))}
    </select>
  );
}

function SwapLangs({ className, disabled, label, onClick }: { className?: string; disabled: boolean; label: string; onClick: () => void }) {
  return (
    <Button
      aria-label={label}
      className={cn("bg-transparent hover:bg-transparent disabled:cursor-not-allowed", className)}
      disabled={disabled}
      size="icon-sm"
      type="button"
      variant="ghost"
      onClick={onClick}
    >
      <ArrowRight className="size-4" />
    </Button>
  );
}
