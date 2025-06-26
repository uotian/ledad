import { Message } from "@/app/local-storages";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

interface MessageItemProps {
  message: Message;
  index: number;
  className?: string;
}

interface CommonMessageContentProps {
  message: Message;
  className: string;
}

// 共通のメッセージコンテンツ
function CommonMessageContent({ message, className }: CommonMessageContentProps) {
  return (
    <div className={cn(className, "w-full px-2 py-2 rounded-lg")}>
      <div className="text-sm px-2 whitespace-pre-wrap">{message.text.replace(/\n\n/g, "\n")}</div>
      <Separator className="my-1 bg-border/30" />
      <div className="text-sm px-2 whitespace-pre-wrap opacity-75">{message.translated.replace(/\n\n/g, "\n")}</div>
    </div>
  );
}

// ユーザーメッセージ用のコンテンツ
function UserMessageContent({ message }: { message: Message }) {
  return (
    <div className="flex justify-end max-w-2/3">
      <CommonMessageContent message={message} className="bg-blue-500 text-white" />
    </div>
  );
}

// 受信メッセージ用のコンテンツ
function ReceivedMessageContent({ message }: { message: Message }) {
  return (
    <div className="flex justify-start">
      <CommonMessageContent message={message} className="bg-gray-200 text-gray-800" />
    </div>
  );
}

export default function MessageItem({ message, index, className }: MessageItemProps) {
  const isUser = message.user === 1;

  return (
    <div key={index} className={cn("flex flex-col", isUser ? "items-end" : "items-start", className)}>
      {/* タイムスタンプ */}
      <div className="text-xs text-gray-500 mb-1">{new Date(message.datetime).toLocaleString("ja-JP")}</div>

      {/* メッセージコンテンツ */}
      {isUser ? <UserMessageContent message={message} /> : <ReceivedMessageContent message={message} />}
    </div>
  );
}
