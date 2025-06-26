import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { clearMessages } from "@/app/local-storages";

export default function Trash() {
  const handleClearMessages = () => {
    // 確認ダイアログを表示
    if (confirm("すべてのメッセージを削除しますか？")) {
      clearMessages();
      console.log("メッセージが初期化されました");
    }
  };

  return (
    <Button variant="ghost" size="icon" className="h-9 w-9" onClick={handleClearMessages}>
      <Trash2 className="h-4 w-4" />
      <span className="sr-only">ゴミ箱</span>
    </Button>
  );
}
