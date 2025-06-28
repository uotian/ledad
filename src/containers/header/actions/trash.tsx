import { Trash2 } from "lucide-react";
import ButtonSquare from "@/components/myui/button-square";
import { clearMessages } from "@/lib/storage";

export default function Trash() {
  const handleClearMessages = () => {
    if (confirm("すべてのメッセージを削除しますか？")) {
      clearMessages();
      console.log("メッセージが初期化されました");
    }
  };

  return (
    <ButtonSquare size="sm" onClick={handleClearMessages} className="rounded-none border-l-0">
      <Trash2 className="h-4 w-4" strokeWidth={1.5} />
      <span className="sr-only">ゴミ箱</span>
    </ButtonSquare>
  );
}
