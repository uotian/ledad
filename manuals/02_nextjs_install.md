# Next.js（App Router）+ TypeScript + Tailwind CSS インストール手順

## 1. プロジェクトディレクトリの作成

```bash
mkdir プロジェクト名
cd プロジェクト名
```

## 2. Next.js プロジェクトの作成

以下のコマンドを実行します。

```bash
npx create-next-app@latest . \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*" \
  --yes
```

- `--typescript`: TypeScriptを有効化
- `--tailwind`: Tailwind CSSを導入
- `--eslint`: ESLintを導入
- `--app`: App Router構成で作成
- `--src-dir`: `src`ディレクトリを利用
- `--import-alias "@/*"`: インポートエイリアスを設定
- `--yes`: 対話なしで進行

## 3. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで `http://localhost:3000` にアクセスして、初期画面が表示されることを確認してください。

---

以上でNext.js（App Router）+ TypeScript + Tailwind CSSのセットアップは完了です。
