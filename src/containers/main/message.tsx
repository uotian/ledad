import { Message } from "@/lib/storage";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { Loader2 } from "lucide-react";

interface MessageItemProps {
  message: Message;
  className?: string;
}

interface CommonMessageContentProps {
  message: Message;
  className: string;
}

function CommonMessageContent({ message, className }: CommonMessageContentProps) {
  return (
    <div className={cn("w-full px-2 py-2 rounded-lg", className)}>
      <div className="text-sm px-2 whitespace-pre-wrap flex items-center gap-2">
        {message.text.replace(/\n\n/g, "\n")}
        {message.status === "processing" && <Loader2 className="h-4 w-4 animate-spin" />}
      </div>
      {message.translated && (
        <>
          <Separator className="my-1 bg-background/30" />
          <div className="text-sm px-2 whitespace-pre-wrap opacity-75">{message.translated.replace(/\n\n/g, "\n")}</div>
        </>
      )}
      {message.status === "error" && (
        <>
          <Separator className="my-1 bg-background/30" />
          <div className="text-sm px-2 text-destructive opacity-75">エラーが発生しました</div>
        </>
      )}
    </div>
  );
}

function MessageContentA({ message }: { message: Message }) {
  return (
    <div className="flex justify-start max-w-2/3">
      <CommonMessageContent message={message} className="bg-secondary/80 text-secondary-foreground rounded-bl-none border-1" />
    </div>
  );
}

function MessageContentB({ message }: { message: Message }) {
  return (
    <div className="flex justify-end max-w-2/3">
      <CommonMessageContent message={message} className="bg-primary/80 text-primary-foreground rounded-br-none" />
    </div>
  );
}

export default function MessageItem({ message, className }: MessageItemProps) {
  const isA = message.user === "A";
  return (
    <div className={cn("flex flex-col", isA ? "items-start" : "items-end", className)}>
      <div className="text-xs mb-1 px-1">{new Date(message.datetime).toLocaleString("ja-JP")}</div>
      {isA ? <MessageContentA message={message} /> : <MessageContentB message={message} />}
    </div>
  );
}
