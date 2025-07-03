import { cn } from "@/lib/utils";

export default function TestTailwindPage() {
  return (
    <div className="p-8 space-y-4">
      <h1 className="text-2xl font-bold">Tailwind CSS テスト</h1>

      <div className="space-y-2">
        <h2 className="text-lg font-semibold">フォントサイズテスト</h2>
        <div className="space-y-1">
          <div className={cn("text-2xs bg-blue-100 p-2 rounded")}>
            text-2xs (カスタムサイズ: 0.675rem = 10.8px)
          </div>
          <div className={cn("text-3xs bg-purple-100 p-2 rounded")}>
            text-3xs (カスタムサイズ: 0.5rem = 8px)
          </div>
          <div className={cn("text-xs bg-green-100 p-2 rounded")}>
            text-xs (デフォルト: 0.75rem = 12px)
          </div>
          <div className={cn("text-sm bg-yellow-100 p-2 rounded")}>
            text-sm (デフォルト: 0.875rem = 14px)
          </div>
          <div className={cn("text-base bg-red-100 p-2 rounded")}>
            text-base (デフォルト: 1rem = 16px)
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Grid 縦並びテスト</h2>
        <div className="grid grid-cols-1 gap-4">
          <div className={cn("bg-blue-100 p-4 rounded")}>アイテム 1</div>
          <div className={cn("bg-green-100 p-4 rounded")}>アイテム 2</div>
          <div className={cn("bg-yellow-100 p-4 rounded")}>アイテム 3</div>
          <div className={cn("bg-red-100 p-4 rounded")}>アイテム 4</div>
        </div>
      </div>

      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Flexbox 縦並びテスト</h2>
        <div className="flex flex-col gap-4">
          <div className={cn("bg-blue-100 p-4 rounded")}>アイテム 1</div>
          <div className={cn("bg-green-100 p-4 rounded")}>アイテム 2</div>
          <div className={cn("bg-yellow-100 p-4 rounded")}>アイテム 3</div>
          <div className={cn("bg-red-100 p-4 rounded")}>アイテム 4</div>
        </div>
      </div>

      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Grid vs Flexbox 比較</h2>
        <div className="grid grid-cols-2 gap-8">
          <div>
            <h3 className={cn("font-semibold mb-2")}>Grid (縦並び)</h3>
            <div className="grid grid-cols-1 gap-2">
              <div className={cn("bg-blue-100 p-2 rounded text-sm")}>
                Grid アイテム 1
              </div>
              <div className={cn("bg-blue-100 p-2 rounded text-sm")}>
                Grid アイテム 2
              </div>
              <div className={cn("bg-blue-100 p-2 rounded text-sm")}>
                Grid アイテム 3
              </div>
            </div>
          </div>
          <div>
            <h3 className={cn("font-semibold mb-2")}>Flexbox (縦並び)</h3>
            <div className="flex flex-col gap-2">
              <div className={cn("bg-green-100 p-2 rounded text-sm")}>
                Flex アイテム 1
              </div>
              <div className={cn("bg-green-100 p-2 rounded text-sm")}>
                Flex アイテム 2
              </div>
              <div className={cn("bg-green-100 p-2 rounded text-sm")}>
                Flex アイテム 3
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <h2 className="text-lg font-semibold">実際のコンポーネントテスト</h2>
        <div className="flex">
          <div
            className={cn(
              "h-8 w-16 border border-gray-300 flex-col rounded-l-xl bg-gray-800 text-white pl-1 font-bold flex items-center justify-center"
            )}
          >
            <div className="text-xs">User1</div>
            <div className={cn("text-2xs font-normal")}>en→ja</div>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <h2 className="text-lg font-semibold">レスポンシブテスト</h2>
        <div className="space-y-1">
          <div className={cn("text-2xs lg:text-xs bg-purple-100 p-2 rounded")}>
            text-2xs lg:text-xs (モバイル: 10.8px, デスクトップ: 12px)
          </div>
          <div className={cn("text-3xs lg:text-sm bg-orange-100 p-2 rounded")}>
            text-3xs lg:text-sm (モバイル: 8px, デスクトップ: 14px)
          </div>
        </div>
      </div>
    </div>
  );
}
