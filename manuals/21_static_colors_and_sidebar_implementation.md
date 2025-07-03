# 静的色設定とサイドバー実装の詳細変更点

## 概要

このドキュメントでは、前回のコミット（`0556fb8`）から現在の作業中の変更点までを詳細にまとめています。主な変更内容は以下の通りです：

1. **静的色設定の実装** - ライトモードとダークモードで色が変わらない色設定
2. **サイドバー機能の実装** - AIチャット機能付きサイドバー
3. **UI/UXの改善** - レイアウト調整とカラーパレット機能の強化

## 主要な変更ファイル

### 1. 静的色設定関連

#### `src/app/globals.css`

- **静的色のユーティリティクラス追加**

  ```css
  /* 静的色のユーティリティクラス */
  .bg-static1 {
    background-color: oklch(80% 0.04 90) !important;
  }
  .bg-static2 {
    background-color: oklch(35% 0.02 90) !important;
  }

  .text-static1 {
    color: oklch(35% 0.02 90) !important;
  }
  .text-static2 {
    color: oklch(80% 0.04 90) !important;
  }
  ```

- **Tailwind CSS v4対応**
  - `@theme inline`セクションで静的色の定義
  - ダークモード対応のための設定調整

### 2. サイドバー機能実装

#### 新規ファイル: `src/containers/sidebar/index.tsx`

- **AIチャット機能付きサイドバー**
  - ChatGPT APIとの連携
  - チャット履歴の表示と管理
  - リアルタイムでの質問・回答機能
  - ルーム別のチャット履歴保存

#### 新規ファイル: `src/containers/sidebar/markdown.tsx`

- **Markdown表示コンポーネント**
  - ReactMarkdownを使用したリッチテキスト表示
  - コードブロック、リンク、テーブル等のサポート
  - ダークテーマに最適化されたスタイリング

### 3. レイアウト変更

#### `src/app/layout.tsx`

- **ヘッダーの移動**
  - ヘッダーをlayout.tsxからpage.tsxに移動
  - より柔軟なレイアウト制御を実現

#### `src/app/page.tsx`

- **グリッドレイアウトの実装**
  ```tsx
  <div className="grid grid-cols-5 h-screen">
    <div
      className={`relative flex flex-col h-screen transition-all duration-300 overflow-y-auto ${sidebarOpen ? "col-span-3" : "col-span-5"}`}
    >
      <Header sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      <div className="flex-1 overflow-y-auto px-4">
        <Main />
        <Footer />
      </div>
    </div>
    <div
      className={`col-span-2 transition-all duration-300 overflow-y-auto ${sidebarOpen ? "block" : "hidden"}`}
    >
      <Sidebar setSidebarOpen={setSidebarOpen} />
    </div>
  </div>
  ```

### 4. ヘッダー機能の拡張

#### `src/containers/header/index.tsx`

- **サイドバートグル機能の追加**
  - `sidebarOpen`と`toggleSidebar`プロパティの追加
  - レイアウト調整（`absolute`位置指定）

#### `src/containers/header/actions/index.tsx`

- **新しいアクションボタンの追加**
  - カラーパレットボタン（Palette）
  - サイドバートグルボタン（PanelRightOpen/Close）
  - ボタンの配置とスタイリング調整

#### `src/containers/header/actions/colors-dialog.tsx`

- **カラーパレット機能の大幅改善**
  - ライトモードとダークモードの色を並列表示
  - より詳細な色情報の表示
  - UI/UXの向上

### 5. 削除されたファイル

#### `src/containers/header/note-dialog.tsx`

- **ノートダイアログの削除**
  - サイドバー機能に統合されたため削除
  - 機能の重複を避けるための整理

### 6. フッター調整

#### `src/containers/footer/index.tsx`

- **レイアウト調整**
  - `fixed`から`absolute`位置指定に変更
  - サイドバーとの競合を回避

#### `src/containers/footer/mic-input.tsx`

- **テキスト色の調整**
  - ダークモードでの可読性向上

### 7. メインコンテンツ調整

#### `src/containers/main/index.tsx`

- **パディングの追加**
  - サイドバーとの間隔調整

#### `src/containers/main/message.tsx`

- **ダークモード対応**
  - ステータス表示の色調整

## 技術的な改善点

### 1. Tailwind CSS v4対応

- `@theme inline`ディレクティブの使用
- カスタムユーティリティクラスの実装
- ダークモード対応の改善

### 2. 状態管理の改善

- サイドバーの開閉状態管理
- ルーム別のチャット履歴管理
- リアルタイムでの状態更新

### 3. パフォーマンス最適化

- コンポーネントの適切な分割
- 不要なファイルの削除
- 効率的なレンダリング

## 使用方法

### 静的色の使用

```tsx
// 背景色として使用
<div className="bg-static1">静的背景色</div>

// テキスト色として使用
<div className="text-static2">静的テキスト色</div>
```

### サイドバーの操作

- ヘッダーの右端にあるサイドバートグルボタンをクリック
- サイドバー内でChatGPTとのチャットが可能
- ルーム別にチャット履歴が保存される

## 今後の改善予定

1. **静的色の追加**
   - より多くの静的色の定義
   - 色の組み合わせパターンの提供

2. **サイドバー機能の拡張**
   - ファイルアップロード機能
   - 画像認識機能
   - 音声入力機能

3. **UI/UXのさらなる改善**
   - アニメーションの追加
   - レスポンシブデザインの改善
   - アクセシビリティの向上

## 注意事項

- 静的色は`!important`を使用しているため、他のスタイルを上書きします
- サイドバーは現在デスクトップ向けに最適化されています
- ChatGPT APIの利用には適切なAPIキーの設定が必要です
