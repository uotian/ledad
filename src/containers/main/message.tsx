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
          <Separator className="my-1 bg-border/75" />
          <div className="text-sm px-2 whitespace-pre-wrap opacity-75">{message.translated.replace(/\n\n/g, "\n")}</div>
        </>
      )}
      {message.status === "error" && (
        <>
          <Separator className="my-1 bg-background/60" />
          <div className="text-sm px-2 text-destructive opacity-75">エラーが発生しました</div>
        </>
      )}
    </div>
  );
}

function UserMessageContent({ message }: { message: Message }) {
  return (
    <div className="flex justify-end max-w-2/3">
      <CommonMessageContent message={message} className="bg-primary/80 text-primary-foreground rounded-br-none" />
    </div>
  );
}

function ReceivedMessageContent({ message }: { message: Message }) {
  return (
    <div className="flex justify-start max-w-2/3">
      <CommonMessageContent message={message} className="bg-card/80 text-card-foreground rounded-bl-none border-1" />
    </div>
  );
}

export default function MessageItem({ message, className }: MessageItemProps) {
  const isUser = message.user === 2;

  return (
    <div className={cn("flex flex-col", isUser ? "items-end" : "items-start", className)}>
      <div className="text-xs mb-1 px-1">{new Date(message.datetime).toLocaleString("ja-JP")}</div>
      {isUser ? <UserMessageContent message={message} /> : <ReceivedMessageContent message={message} />}
    </div>
  );
}
