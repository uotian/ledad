# Cursor 設定改善マニュアル

## 概要

このマニュアルでは、Cursor エディタでの Next.js 開発を効率化するための設定と拡張機能の導入について説明します。

## 前提条件

- Cursor エディタがインストール済み
- Next.js プロジェクトが存在する

## 1. 推奨拡張機能のインストール

### 1.1 必須セット（Cursor の AI 機能を最大限活用）

#### Tailwind CSS IntelliSense

```bash
code --install-extension bradlc.vscode-tailwindcss
```

- **目的**: Tailwind CSS クラスの補完とプレビュー
- **効果**: Cursor の AI が Tailwind クラスを理解し、より良い提案を提供

#### ESLint

```bash
code --install-extension dbaeumer.vscode-eslint
```

- **目的**: コードの静的解析とリアルタイムエラー検出
- **効果**: Cursor の AI がコード品質を理解し、より良い修正提案を提供

#### Prettier - Code formatter

```bash
code --install-extension esbenp.prettier-vscode
```

- **目的**: コードの自動整形
- **効果**: Cursor の AI が生成したコードを自動整形し、一貫したスタイルを維持

### 1.2 開発効率向上セット

#### ES7+ React/Redux/React-Native snippets

```bash
code --install-extension dsznajder.es7-react-js-snippets
```

- **目的**: React/Next.js のスニペット提供
- **効果**: Cursor の AI と組み合わせて、より速いコンポーネント生成

#### Path Intellisense

```bash
code --install-extension christian-kohler.path-intellisense
```

- **目的**: ファイルパスの自動補完
- **効果**: Cursor の AI がファイルパスを正確に提案

#### Import Cost

```bash
code --install-extension wix.vscode-import-cost
```

- **目的**: import したモジュールのサイズ表示
- **効果**: Cursor の AI がパフォーマンスを考慮した提案を提供

### 1.3 UI/UX 向上セット

#### VSCode Icons

```bash
code --install-extension vscode-icons-team.vscode-icons
```

- **目的**: ファイルアイコンの視覚化
- **効果**: プロジェクト構造が分かりやすくなり、Cursor の AI も理解しやすくなる

#### Bracket Pair Colorizer 2

```bash
code --install-extension CoenraadS.bracket-pair-colorizer-2
```

- **目的**: 括弧の対応関係の色分け
- **効果**: 複雑な JSX も見やすく、Cursor の AI の提案も理解しやすくなる

#### Error Lens

```bash
code --install-extension usernamehw.errorlens
```

- **目的**: エラーの行内表示
- **効果**: エラーが行内に表示され、Cursor の AI が問題を理解しやすくなる

## 2. プロジェクト固有の設定

### 2.1 .vscode/settings.json の作成

プロジェクトルートに`.vscode/settings.json`を作成：

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "tailwindCSS.includeLanguages": {
    "typescript": "javascript",
    "typescriptreact": "javascript"
  },
  "emmet.includeLanguages": {
    "typescript": "html",
    "typescriptreact": "html"
  },
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "typescript.preferences.importModuleSpecifier": "relative",
  "javascript.preferences.importModuleSpecifier": "relative",
  "editor.tabSize": 2,
  "editor.insertSpaces": true,
  "editor.detectIndentation": false,
  "files.eol": "\n",
  "files.trimTrailingWhitespace": true,
  "files.insertFinalNewline": true,
  "editor.rulers": [80],
  "editor.wordWrap": "on",
  "editor.minimap.enabled": true,
  "workbench.iconTheme": "vscode-icons",
  "errorLens.enabled": true,
  "errorLens.messageEnabled": true,
  "errorLens.statusBarMessageEnabled": true,
  "errorLens.statusBarColorsEnabled": true,
  "cursor.autoComplete.enabled": true,
  "cursor.inlineChat.enabled": true,
  "cursor.showInlineChatButton": true,
  "cursor.enableCodeActions": true,
  "cursor.showErrorLens": true,
  "cursor.autoCompleteDelay": 100,
  "editor.suggestSelection": "first",
  "editor.acceptSuggestionOnCommitCharacter": true,
  "editor.acceptSuggestionOnEnter": "on",
  "editor.quickSuggestions": {
    "other": true,
    "comments": false,
    "strings": true
  },
  "editor.quickSuggestionsDelay": 100,
  "editor.suggestOnTriggerCharacters": true,
  "editor.tabCompletion": "on"
}
```

### 2.2 .prettierrc.json の作成

プロジェクトルートに`.prettierrc.json`を作成：

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": false,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false,
  "bracketSpacing": true,
  "bracketSameLine": false,
  "arrowParens": "always",
  "endOfLine": "lf",
  "quoteProps": "as-needed",
  "jsxSingleQuote": false,
  "proseWrap": "preserve"
}
```

### 2.3 .cursorrules の作成

プロジェクトルートに`.cursorrules`を作成：

```
# Cursor AI Rules for Next.js Development

## プロジェクト概要
このプロジェクトは Next.js 15、TypeScript、Tailwind CSS v4、shadcn/ui コンポーネントを使用しています。

## コーディング規約
- すべてのコンポーネントと関数に TypeScript を使用する
- スタイリングには Tailwind CSS を使用する
- 可能な限り shadcn/ui コンポーネントを使用する
- Next.js 15 App Router の規約に従う
- コンポーネントのインポートには @/ エイリアスを使用する

## ファイル構造
- コンポーネントは src/components/ に配置
- UI コンポーネントは src/components/ui/ に配置
- ページは src/app/ に配置
- ユーティリティは src/lib/ に配置
- 型定義は src/types/ に配置

## 命名規則
- コンポーネントは PascalCase を使用
- 関数と変数は camelCase を使用
- ファイル名は kebab-case を使用
- 説明的な名前を使用する

## コンポーネントガイドライン
- プロパティには常に TypeScript インターフェースを使用する
- React.FC または関数コンポーネントを使用する
- クラスコンポーネントよりも関数コンポーネントを優先する
- 適切な TypeScript 型を使用する

## スタイリングガイドライン
- Tailwind CSS クラスを使用する
- カスタム CSS よりもユーティリティクラスを優先する
- テーマには CSS 変数を使用する
- モバイルファーストのレスポンシブデザインに従う

## パフォーマンスガイドライン
- 画像には Next.js Image コンポーネントを使用する
- 適切なローディング状態を実装する
- 高コストなコンポーネントには React.memo を使用する
- 動的インポートでバンドルサイズを最適化する

## エラーハンドリング
- 非同期操作には try-catch ブロックを使用する
- 適切なエラーバウンダリを実装する
- ユーザーフレンドリーなエラーメッセージを表示する

## アクセシビリティ
- セマンティックな HTML 要素を使用する
- 適切な ARIA ラベルを含める
- キーボードナビゲーションが動作することを確認する
- 適切な色のコントラストを維持する

## 日本語での開発ガイドライン
- コメントは日本語で記述する
- 変数名や関数名は英語を使用する
- エラーメッセージは日本語で表示する
- ユーザー向けのテキストは日本語を使用する
```

## 3. Cursor の AI 機能活用

### 3.1 基本的な AI コマンド

- `/` - コマンドパレットを開く
- `Cmd/Ctrl + K` - インライン編集
- `Cmd/Ctrl + L` - チャット開始
- `Cmd/Ctrl + I` - インライン補完

### 3.2 Next.js 開発での活用例

```
/ 新しいNext.jsコンポーネントを作成して
/ このコンポーネントをTypeScriptに変換して
/ エラーの原因を調べて
/ パフォーマンスを改善して
```

### 3.3 Cursor 設定の最適化

Cursor の設定で以下を有効にする：

- **Auto-complete**: リアルタイムでのコード補完
- **Inline Chat**: インラインでの AI チャット
- **Code Actions**: AI によるコード修正提案
- **Error Detection**: リアルタイムエラー検出
- **Git Integration**: Git との統合機能

### 3.4 推奨設定値

- **Auto-complete delay**: 100ms
- **Inline chat enabled**: true
- **Show inline chat button**: true
- **Enable code actions**: true
- **Show error lens**: true

## 4. 一括インストールスクリプト

### 4.1 インストールスクリプトの作成

`install-cursor-extensions.sh`を作成：

```bash
#!/bin/bash

echo "Installing Cursor extensions for Next.js development..."

# 必須セット（CursorのAI機能を最大限活用）
echo "Installing essential extensions..."
code --install-extension bradlc.vscode-tailwindcss
code --install-extension dbaeumer.vscode-eslint
code --install-extension esbenp.prettier-vscode

# 開発効率向上セット
echo "Installing productivity extensions..."
code --install-extension dsznajder.es7-react-js-snippets
code --install-extension christian-kohler.path-intellisense
code --install-extension wix.vscode-import-cost

# UI/UX向上セット
echo "Installing UI/UX extensions..."
code --install-extension vscode-icons-team.vscode-icons
code --install-extension CoenraadS.bracket-pair-colorizer-2
code --install-extension usernamehw.errorlens

echo "All extensions installed successfully!"
echo ""
echo "Installed extensions:"
echo "✅ Tailwind CSS IntelliSense"
echo "✅ ESLint"
echo "✅ Prettier - Code formatter"
echo "✅ ES7+ React/Redux/React-Native snippets"
echo "✅ Path Intellisense"
echo "✅ Import Cost"
echo "✅ VSCode Icons"
echo "✅ Bracket Pair Colorizer 2"
echo "✅ Error Lens"
echo ""
echo "Next steps:"
echo "1. Restart Cursor to ensure all extensions are loaded"
echo "2. Check that all extensions are working properly"
echo "3. Configure project-specific settings if needed"
```

### 4.2 スクリプトの実行

```bash
chmod +x install-cursor-extensions.sh
./install-cursor-extensions.sh
```

## 5. トラブルシューティング

### 5.1 よくある問題

- **拡張機能が動作しない**: Cursor を再起動
- **Prettier が動作しない**: プロジェクトに Prettier がインストールされているか確認
- **ESLint エラーが表示されない**: ESLint 設定ファイルが正しく配置されているか確認
- **Cursor AI が応答しない**: `.cursorrules`ファイルが正しく配置されているか確認

### 5.2 パフォーマンス最適化

- 不要な拡張機能は無効化
- 大きなプロジェクトでは、一部の拡張機能を無効化することを検討
- Cursor の AI 設定を調整して応答速度を最適化

## 6. 今回の作業内容

### 6.1 実施した作業

1. **shadcn/ui 導入**: 美しい UI コンポーネントライブラリの導入
2. **ダークモード対応**: next-themes を使った完全なダークモード実装
3. **テーマ切り替えボタン**: 画面右上に固定されたテーマ切り替え機能
4. **セットアップマニュアル作成**: `manuals/03_shadcn_ui_setup.md`の作成
5. **Cursor 拡張機能インストール**: 9 つの推奨拡張機能をインストール
6. **プロジェクト設定ファイル作成**: `.vscode/settings.json`, `.prettierrc.json`, `.cursorrules`の作成

### 6.2 追加されたファイル

- `components.json` - shadcn/ui 設定
- `src/components/theme-provider.tsx` - テーマプロバイダー
- `src/components/theme-toggle.tsx` - テーマ切り替えボタン
- `src/components/ui/` - shadcn/ui コンポーネント群
- `src/lib/utils.ts` - ユーティリティ関数
- `manuals/03_shadcn_ui_setup.md` - shadcn/ui セットアップマニュアル
- `.vscode/settings.json` - VSCode/Cursor 設定
- `.prettierrc.json` - Prettier 設定
- `.cursorrules` - Cursor AI ルール（日本語版）
- `install-cursor-extensions.sh` - Cursor 拡張機能一括インストールスクリプト

### 6.3 更新されたファイル

- `package.json` - 依存関係の追加
- `src/app/layout.tsx` - ThemeProvider の統合
- `src/app/page.tsx` - ThemeToggle の追加
- `src/app/globals.css` - CSS 変数の更新

## 7. 参考リンク

- [Cursor 公式ドキュメント](https://cursor.sh/docs)
- [VSCode 拡張機能マーケットプレイス](https://marketplace.visualstudio.com/)
- [Tailwind CSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss)
- [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

---

このマニュアルに従って設定することで、Cursor エディタでの Next.js 開発効率が大幅に向上し、AI 機能を最大限活用できるようになります。

# 設定をエクスポート

code --list-extensions > extensions.txt
