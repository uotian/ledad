# 05. チャットページスケルトン作成手順

## 概要

このマニュアルでは、Next.js 15、TypeScript、Tailwind CSS v4、shadcn/ui を使用してチャットページのスケルトン（ローディング状態）を作成する手順を説明します。

## 前提条件

- Node.js がインストールされている
- Next.js プロジェクトが作成されている
- shadcn/ui がセットアップされている
- 基本的な UI コンポーネントがインストールされている

## 手順

### 1. 必要なコンポーネントの確認

以下の shadcn/ui コンポーネントが必要です：

- `Skeleton` - ローディング状態の表示
- `ThemeToggle` - テーマ切り替えボタン

### 2. カスタムコンポーネントの作成

#### 2.1 チャットメッセージスケルトンコンポーネント

`src/components/myui/chat-message-skeleton.tsx` を作成：

```tsx
import { Skeleton } from "@/components/ui/skeleton";

interface ChatMessageSkeletonProps {
  w: string;
  h: string;
  type: "sent" | "received";
}

export function ChatMessageSkeleton({ w, h, type }: ChatMessageSkeletonProps) {
  return (
    <div className={`flex ${type === "sent" ? "justify-end" : "justify-start"}`}>
      <div className={`${w} ${h} rounded-lg`}>
        <Skeleton className="w-full h-full rounded-lg" />
      </div>
    </div>
  );
}
```

### 3. メインページの作成

#### 3.1 基本的なレイアウト構造

`src/app/page.tsx` を以下の構造で作成：

```tsx
import { Skeleton } from "@/components/ui/skeleton";
import { ThemeToggle } from "@/components/theme-toggle";
import { ChatMessageSkeleton } from "@/components/myui/chat-message-skeleton";

export default function Home() {
  return (
    <div className="bg-background overflow-y-auto">
      {/* ヘッダー - 固定 */}
      <header className="fixed top-0 left-0 right-0 z-50">{/* ヘッダーコンテンツ */}</header>

      {/* メインコンテンツ - チャットエリア - 固定高さでスクロール */}
      <main className="pt-20 pb-24 h-[100vh]">{/* メッセージエリア */}</main>

      {/* フッター - メッセージ入力エリア - 固定 */}
      <footer className="fixed bottom-0 left-0 right-0 z-50">{/* フッターコンテンツ */}</footer>
    </div>
  );
}
```

#### 3.2 ヘッダー部分の実装

```tsx
<header className="fixed top-0 left-0 right-0 z-50">
  <div className="container mx-auto p-4">
    <div className="flex items-center">
      {/* ロゴSkeleton */}
      <Skeleton className="h-8 w-48" />
      <div className="flex-1" />
      {/* ヘッダーアクション */}
      <div className="flex items-center gap-8">
        <Skeleton className="h-8 w-8 rounded-full" />
        <Skeleton className="h-8 w-8 rounded-full" />
        <ThemeToggle />
      </div>
    </div>
  </div>
</header>
```

#### 3.3 メインコンテンツ部分の実装

```tsx
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
```

#### 3.4 フッター部分の実装

```tsx
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
```

### 4. レイアウトの重要なポイント

#### 4.1 固定ヘッダー・フッター

- `fixed top-0 left-0 right-0 z-50` - ヘッダーを上部に固定
- `fixed bottom-0 left-0 right-0 z-50` - フッターを下部に固定
- `z-50` - 他の要素の上に表示

#### 4.2 メインエリアのスクロール制御

- `pt-20 pb-24` - ヘッダーとフッターの高さ分のパディング
- `h-[100vh]` - 画面の高さ全体（100vh = 100% viewport height）
- ルートコンテナに `overflow-y-auto` を設定

#### 4.3 全体のスクロール制御

- ルートコンテナに `bg-background overflow-y-auto` を設定
- `min-h-screen` と `flex flex-col` は不要
- body 要素は通常のスクロール設定を維持

### 5. 背景色のカスタマイズ（オプション）

#### 5.1 グローバル背景色の変更

`src/app/globals.css` の CSS 変数を変更：

```css
:root {
  --background: oklch(78.872% 0.04335 87.362); /* カスタム背景色 */
}

.dark {
  --background: oklch(0.129 0.042 264.695); /* ダークモード用 */
}
```

#### 5.2 透明なヘッダー・フッター

ヘッダーとフッターから背景色クラスを削除して透明に：

```tsx
<header className="fixed top-0 left-0 right-0 z-50">
<footer className="fixed bottom-0 left-0 right-0 z-50">
```

### 6. 完成した機能

- ✅ 固定ヘッダー（透明背景）
- ✅ 固定フッター（透明背景）
- ✅ メインエリアの固定高さ（100vh）
- ✅ 全体のスクロール制御
- ✅ レスポンシブデザイン
- ✅ ダークモード対応
- ✅ スケルトンローディング状態

## 次のステップ

このスケルトンが完成したら、以下の機能を追加できます：

1. 実際のチャット機能の実装
2. メッセージ送信機能
3. リアルタイム通信
4. ユーザー認証
5. メッセージ履歴の保存

## 参考リンク

- [Next.js 15 Documentation](https://nextjs.org/docs)
- [Tailwind CSS v4 Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
