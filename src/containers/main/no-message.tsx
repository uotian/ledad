import { WidgetTypes } from "@/lib/types";

export default function NoMessage({ className }: WidgetTypes) {
  return (
    <div className={`flex items-center justify-center h-full ${className || ""}`}>
      <p className="text-foreground">メッセージを入力してください</p>
    </div>
  );
}
