import { Message } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

interface Props {
  message: Message;
  className?: string;
}

const CommonMessageContent = ({ message, className }: Props) => (
  <div className={cn("w-full px-2 py-2 rounded-lg", className)}>
    <div className="text-sm px-2 whitespace-pre-wrap flex items-center gap-2">{message.text.replace(/\n\n/g, "\n")}</div>
    <Separator className="my-1 bg-background/30" />
    {message.status === "translating" && <div className="text-sm px-2 whitespace-pre-wrap opacity-75">翻訳中...</div>}
    {message.status === "success" && <div className="text-sm px-2 whitespace-pre-wrap opacity-75">{message.translated}</div>}
    {message.status === "error" && <div className="text-sm px-2 text-destructive opacity-75">エラー</div>}
  </div>
);

const MessageContentA = ({ message }: { message: Message }) => (
  <div className="flex justify-start max-w-2/3">
    <CommonMessageContent message={message} className="bg-secondary/80 text-secondary-foreground rounded-bl-none" />
  </div>
);

const MessageContentB = ({ message }: { message: Message }) => (
  <div className="flex justify-end max-w-2/3">
    <CommonMessageContent message={message} className="bg-primary/80 text-primary-foreground rounded-br-none" />
  </div>
);

export default function MessageItem({ message, className }: Props) {
  return (
    <div className={cn("flex flex-col", message.user === "A" ? "items-start" : "items-end", className)}>
      <div className="text-xs mb-1 px-1">{new Date(message.datetime).toLocaleString("ja-JP")}</div>
      {message.user === "A" && <MessageContentA message={message} />}
      {message.user === "B" && <MessageContentB message={message} />}
    </div>
  );
}
