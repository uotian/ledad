import { Skeleton } from "@/components/ui/skeleton";
import { ChatMessageSkeleton } from "@/components/myui/chat-message-skeleton";
import Header from "@/containers/header";

export default function Home() {
  return (
    <div className="bg-background overflow-y-auto">
      <Header />

      {/* メインコンテンツ - チャットエリア - 固定高さでスクロール */}
      <main className="pt-20 pb-24 h-[100vh]">
        <div className="container mx-auto p-4">
          {/* メッセージエリア */}
          <div className="flex flex-col gap-4">
            {/* 受信/送信メッセージSkeletons */}
            <ChatMessageSkeleton w="w-48" h="h-16" type="received" />
            <ChatMessageSkeleton w="w-40" h="h-12" type="sent" />
            <ChatMessageSkeleton w="w-32" h="h-8" type="received" />
            <ChatMessageSkeleton w="w-56" h="h-20" type="sent" />
            <ChatMessageSkeleton w="w-36" h="h-10" type="received" />
            <ChatMessageSkeleton w="w-48" h="h-16" type="received" />
            <ChatMessageSkeleton w="w-40" h="h-12" type="sent" />
            <ChatMessageSkeleton w="w-32" h="h-8" type="received" />
            <ChatMessageSkeleton w="w-56" h="h-20" type="sent" />
            <ChatMessageSkeleton w="w-36" h="h-10" type="received" />
          </div>
        </div>
      </main>

      {/* フッター - メッセージ入力エリア - 固定 */}
      <footer className="fixed bottom-0 left-0 right-0 z-50">
        <div className="container mx-auto p-4">
          <div className="flex items-center gap-4">
            {/* メッセージ入力フィールド */}
            <div className="flex-1">
              <Skeleton className="h-12 w-full rounded-lg" />
            </div>
            {/* アクションボタン */}
            <div className="flex items-center gap-4">
              <Skeleton className="h-12 w-12 rounded-lg" />
              <Skeleton className="h-12 w-24 rounded-lg" />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
