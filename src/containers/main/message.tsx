import { Message } from "@/lib/storage";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { Loader2 } from "lucide-react";

interface MessageItemProps {
  message: Message;
  index: number;
  className?: string;
}

interface CommonMessageContentProps {
  message: Message;
  className: string;
}

function CommonMessageContent({ message, className }: CommonMessageContentProps) {
  return (
    <div className={cn(className, "w-full px-2 py-2 rounded-lg")}>
      <div className="text-sm px-2 whitespace-pre-wrap flex items-center gap-2">
        {message.text.replace(/\n\n/g, "\n")}
        {message.status === "processing" && <Loader2 className="h-4 w-4 animate-spin" />}
      </div>
      {message.translated && (
        <>
          <Separator className="my-1 bg-border/30" />
          <div className="text-sm px-2 whitespace-pre-wrap opacity-75">{message.translated.replace(/\n\n/g, "\n")}</div>
        </>
      )}
      {message.status === "error" && (
        <>
          <Separator className="my-1 bg-border/30" />
          <div className="text-sm px-2 text-red-600 opacity-75">エラーが発生しました</div>
        </>
      )}
    </div>
  );
}

function UserMessageContent({ message }: { message: Message }) {
  return (
    <div className="flex justify-end max-w-2/3">
      <CommonMessageContent message={message} className="bg-blue-500 text-white" />
    </div>
  );
}

function ReceivedMessageContent({ message }: { message: Message }) {
  return (
    <div className="flex justify-start">
      <CommonMessageContent message={message} className="bg-gray-200 text-gray-800" />
    </div>
  );
}

export default function MessageItem({ message, index, className }: MessageItemProps) {
  const isUser = message.user === 2;

  return (
    <div key={index} className={cn("flex flex-col", isUser ? "items-end" : "items-start", className)}>
      <div className="text-xs text-gray-500 mb-1">{new Date(message.datetime).toLocaleString("ja-JP")}</div>
      {isUser ? <UserMessageContent message={message} /> : <ReceivedMessageContent message={message} />}
    </div>
  );
}
