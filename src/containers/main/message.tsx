import { Message } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { SpeakerButton } from "./speak/button";

interface Props {
  message: Message;
  className?: string;
}

const CommonMessageContent = ({ message, className }: Props) => {
  return (
    <div className={cn("w-full p-2 rounded-lg", className)}>
      <details className="text-base pl-2" open>
        <summary className="cursor-pointer opacity-60 hover:opacity-100 transition-opacity duration-200 text-xs">
          <span>original</span>
        </summary>
        <div className="flex items-center justify-between gap-2">
          <div className="whitespace-pre-wrap opacity-80">{message.text}</div>
          <SpeakerButton text={message.text || ""} />
        </div>
      </details>
      <Separator className="my-1 bg-background/30" />
      <details className="mt-2 text-base pl-2" open>
        <summary className="cursor-pointer opacity-60 hover:opacity-100 transition-opacity duration-200 text-xs">
          <span>translation</span>
        </summary>
        <div className="flex items-center justify-between gap-2">
          <div className="whitespace-pre-wrap opacity-80">
            {message.translated}
          </div>
          <SpeakerButton text={message.translated || ""} />
        </div>
      </details>
    </div>
  );
};

const MessageContentA = ({ message }: { message: Message }) => (
  <div className="flex justify-start max-w-4/5">
    <CommonMessageContent
      message={message}
      className="bg-secondary/80 text-secondary-foreground rounded-bl-none"
    />
  </div>
);

const MessageContentB = ({ message }: { message: Message }) => (
  <div className="flex justify-end max-w-4/5">
    <CommonMessageContent
      message={message}
      className="bg-primary/80 text-primary-foreground rounded-br-none"
    />
  </div>
);

export default function MessageItem({ message, className }: Props) {
  return (
    <div
      className={cn(
        "flex flex-col gap-1",
        message.user === "A" ? "items-start" : "items-end",
        className
      )}
    >
      <div className="flex items-center gap-2 text-xs px-1">
        <div>{new Date(message.timestamp * 1000).toLocaleString("ja-JP")}</div>
        {message.status?.includes("error") ? (
          <div className="text-red-800 dark:text-red-100">{message.status}</div>
        ) : message.status?.includes("success") ? (
          <div className="text-blue-800 dark:text-blue-100">
            {message.status}
          </div>
        ) : message.status?.includes("completed") ? (
          <div className="text-green-800 dark:text-green-100">
            {message.status}
          </div>
        ) : (
          <div className="text-blue-800 dark:text-blue-100">
            {message.status}
          </div>
        )}
      </div>
      {message.user === "A" && <MessageContentA message={message} />}
      {message.user === "B" && <MessageContentB message={message} />}
    </div>
  );
}
