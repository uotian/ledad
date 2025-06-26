// スケルトンコンポーネント（メッセージがない場合の表示用）
function ChatMessageSkeleton({ w, h, type }: { w: string; h: string; type: "sent" | "received" }) {
  return (
    <div className={`flex ${type === "sent" ? "justify-end" : "justify-start"}`}>
      <div className={`${w} ${h} bg-gray-200 rounded-lg animate-pulse`}></div>
    </div>
  );
}

export default function NoData() {
  return (
    <>
      <ChatMessageSkeleton w="w-48" h="h-16" type="received" />
      <ChatMessageSkeleton w="w-40" h="h-12" type="sent" />
      <ChatMessageSkeleton w="w-32" h="h-8" type="received" />
    </>
  );
}
