# ヘッダーの実装

## 概要

このドキュメントは、ヘッダーコンポーネントをスケルトン状態から実装状態に変更した際の差分をまとめたものです。

## 変更前（スケルトン状態）

### `src/app/page.tsx` のヘッダー部分

```tsx
{
  /* ヘッダー - 固定 */
}
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
</header>;
```

### 特徴

- ヘッダーが`page.tsx`内に直接記述
- ロゴ部分は`Skeleton`コンポーネント
- アクション部分も`Skeleton`コンポーネント（`ThemeToggle`以外）
- 中央部分は空の`div`（`flex-1`）

## 変更後（実装状態）

### `src/app/page.tsx` のヘッダー部分

```tsx
<Header />
```

### 新しいヘッダー構造

#### `src/containers/header/index.tsx`

```tsx
"use client";

import Logo from "./logo";
import Actions from "./actions";
import Info from "./info";

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="container mx-auto p-4">
        <div className="flex items-center">
          <Logo />
          <Info className="flex-1 flex justify-center" />
          <Actions />
        </div>
      </div>
    </header>
  );
}
```

## 新しく追加されたコンポーネント

### 1. ロゴコンポーネント

**ファイル**: `src/containers/header/logo.tsx`

```tsx
"use client";

import React from "react";

interface Props {
  className?: string;
}

const Component: React.FC<Props> = ({ className }) => {
  return <div className={`text-xl font-bold ${className}`}>HooTalk</div>;
};

export default Component;
```

### 2. 情報表示コンポーネント

**ファイル**: `src/containers/header/info.tsx`

```tsx
"use client";

import React, { useState, useEffect } from "react";
import { ArrowLeftRight } from "lucide-react";
import { lang1Map, lang2Map, voiceMap } from "@/app/local-storages";
import { getLang1, getLang2, getVoice } from "@/app/local-storages";

interface Props {
  className?: string;
}

const Component: React.FC<Props> = ({ className }) => {
  const [lang1, setLang1] = useState("ja");
  const [lang2, setLang2] = useState("en");
  const [voice, setVoice] = useState("alloy");
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setLang1(getLang1());
    setLang2(getLang2());
    setVoice(getVoice());
  }, []);

  const infoValue = (value: string): string => {
    return isClient ? value : "loading...";
  };

  return (
    <div className={`flex items-center gap-12 text-sm ${className}`}>
      <div className="flex items-center gap-2">
        <span>{infoValue(lang1Map[lang1])}</span>
        <ArrowLeftRight className="h-4 w-4" />
        <span>{infoValue(lang2Map[lang2])}</span>
      </div>
      <span>voice: {infoValue(voiceMap[voice])}</span>
    </div>
  );
};

export default Component;
```

#### ハイドレーションエラーの解決

- **問題**: サーバーサイドレンダリングとクライアントサイドで localStorage の値が異なる
- **解決策**: `useState`と`useEffect`を使用してクライアントサイドでのみ値を読み込み
- **実装**: `infoValue`関数で条件分岐し、クライアントサイドでは実際の値を、サーバーサイドでは「loading...」を表示

### 3. アクションコンテナ

**ファイル**: `src/containers/header/actions/index.tsx`

```tsx
"use client";

import React from "react";
import ThemeToggle from "./theme-toggle";
import Setting from "./setting";

export default function Actions() {
  return (
    <div className="flex items-center gap-4">
      <Setting />
      <ThemeToggle />
    </div>
  );
}
```

#### 3-1. テーマ切り替え（移動）

**ファイル**: `src/containers/header/actions/theme-toggle.tsx`

- 元の`src/components/theme-toggle.tsx`から移動
- 機能は同じ（ダークモード・ライトモード切り替え）

#### 3-2. 設定ダイアログ

**ファイル**: `src/containers/header/actions/setting/index.tsx`

```tsx
"use client";

import React from "react";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import Content from "./content";

export default function Setting() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Settings className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">設定</span>
        </Button>
      </DialogTrigger>
      <Content />
    </Dialog>
  );
}
```

#### 3-3. 設定ダイアログ内容

**ファイル**: `src/containers/header/actions/setting/content.tsx`

- 言語設定（lang1, lang2）の変更
- 音声設定（voice）の変更
- localStorage への保存機能

## 設定管理の実装

### `src/app/local-storages.ts`

```tsx
// 言語設定の連想配列
export const lang1Map: Record<string, string> = {
  ja: "日本語",
  en: "English",
};

export const lang2Map: Record<string, string> = {
  ja: "日本語",
  en: "English",
};

// 音声設定の連想配列
export const voiceMap: Record<string, string> = {
  alloy: "Alloy (中性的)",
  echo: "Echo (男性的)",
  fable: "Fable (物語的)",
  onyx: "Onyx (深い声)",
  nova: "Nova (女性的)",
  shimmer: "Shimmer (明るい声)",
};

// 設定値を取得・保存する関数
export function getLang1(): string {
  if (typeof window !== "undefined") {
    return localStorage.getItem("hootalk_lang1") || "ja";
  }
  return "ja";
}

export function setLang1(value: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("hootalk_lang1", value);
  }
}

// ... 他の関数も同様
```

### カスタムラジオボタン

**ファイル**: `src/components/myui/radio-group.tsx`

- 設定ダイアログで使用
- shadcn/ui の RadioGroup をベースにしたカスタムコンポーネント

## アーキテクチャの改善点

### 1. コンポーネントの分離

- **変更前**: ヘッダーが`page.tsx`内に直接記述
- **変更後**: 独立したコンポーネントとして分離

### 2. 責任の分離

- **Logo**: ロゴ表示のみ
- **Info**: 設定情報表示のみ
- **Actions**: アクションボタン群の管理
- **Setting**: 設定ダイアログの管理

### 3. 再利用性の向上

- 各コンポーネントが独立して動作
- 他のページでも使用可能
- テストがしやすい構造

### 4. 設定管理の実装

- localStorage を使用した永続化
- 言語設定と音声設定の管理
- 設定 UI の実装

## レイアウトの変更

### 変更前

```
[ロゴSkeleton] [空] [アクションSkeleton] [ThemeToggle]
```

### 変更後

```
[ロゴ] [設定情報] [設定ボタン] [ThemeToggle]
```

## 技術的な改善点

### 1. TypeScript の活用

- 各コンポーネントに適切な型定義
- プロパティの型安全性確保

### 2. コンポーネント設計

- 単一責任の原則
- 適切なプロパティ設計
- 再利用可能な構造

### 3. 状態管理

- localStorage による設定の永続化
- 設定値の一元管理

### 4. SSR 対応

- ハイドレーションエラーの解決
- サーバーサイドレンダリング対応

## 今後の課題

### 1. 設定状態管理の改善

- 現在: 設定変更後にページリロードが必要
- 目標: リアクティブな状態更新

### 2. アクセシビリティの向上

- キーボードナビゲーション
- スクリーンリーダー対応

### 3. エラーハンドリング

- 設定保存時のエラー処理
- フォールバック機能

## 関連ファイル

### 新規追加

- `src/containers/header/index.tsx`
- `src/containers/header/logo.tsx`
- `src/containers/header/info.tsx`
- `src/containers/header/actions/index.tsx`
- `src/containers/header/actions/theme-toggle.tsx`
- `src/containers/header/actions/setting/index.tsx`
- `src/containers/header/actions/setting/content.tsx`
- `src/app/local-storages.ts`
- `src/components/myui/radio-group.tsx`

### 移動

- `src/components/theme-toggle.tsx` → `src/containers/header/actions/theme-toggle.tsx`

### 修正

- `src/app/page.tsx` - ヘッダー部分をコンポーネント化
- `src/app/layout.tsx` - レイアウト調整
- `src/lib/utils.ts` - ユーティリティ関数の追加・修正
