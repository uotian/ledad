# ledad

[日本語](README.ja.md) | [English](README.md) | [Français](README.fr.md) | [中文](README.zh.md)

![ledadのリアルタイム文字起こし・翻訳・AI Insightsデモ](docs/assets/ledad-demo.gif)

サンプルデータによる操作デモ

ブラウザのマイク入力を使って、音声をリアルタイムに文字起こし・翻訳し、AI Insightsで会話の話題を要約するWebアプリです。

使用技術：Next.js 16、React 19、TypeScript、OpenAI API、Gemini API

## 主な機能

- ブラウザでのマイク入力
- 低遅延な速報版と60秒ごとの確定版文字起こし
- 速報版・確定版の翻訳
- 話題ごとの概要と現在の話題を、個別に選んだ言語で表示
- 入力言語・翻訳先言語の切り替え
- セッションの開始・停止・クリア

## 使い方

画面右上の歯車アイコン（`Settings`）を押し、以下を設定して `Save` を押します。設定は利用中のブラウザに保存されます。

- `Speech language`／`Translation language`：英語（`en`）・日本語（`ja`）・中国語（`zh`）・フランス語（`fr`）から選びます。初期値は英語→日本語です。画面下部のコントロールパネルには、選択した翻訳方向が表示されます。
- `Insights language`：概要の言語を英語（`en`）・日本語（`ja`、初期値）・中国語（`zh`）・フランス語（`fr`）から個別に選びます。
- `Transcription provider`：文字起こしに使う OpenAI（初期値）または Gemini を選びます。
- `Text size`：S／M／Lから選びます（初期値：M）。
- `Prompt`：OpenAI の文字起こしに使う話題や録音の背景を入力します。
- `Keywords`：固有名詞・専門用語・略語など、表記のヒントを1行に1つ入力します。

`idle` 以外で設定を開くと、セッションを停止するか確認します。`Text size` は保存後すぐに反映され、それ以外の設定は次のセッション開始時に有効になります。

`Stop` を押すと、マイク入力とRealtime接続を停止します。

OpenAI は15秒ごとに音声バッファを確定し、翻訳を自動更新します。Gemini は発話を自動で確定します。

メインパネル右下の消しゴムアイコン（`Clear`）を押すと、表示中の履歴を消去します。セッションは停止しません。

メインパネル左側の `AI Insights` にある `All Topics` は同じ話題をまとめた一覧、`Current Topic` は現在の話題です。タイトルを押すと概要を展開します。狭い画面では書き起こしの上に表示します。

会話中は1分ごとに変更を確認し、表示中の書き起こし・翻訳を、初期設定では `gpt-6-luna`（OpenAI）で要約します。概要は Insights 用の言語で表示されます（初期値：日本語）。横の更新ボタンからは、内容が同じでも再生成できます。処理中はボタンが無効になり、停止後も最後の概要を表示します。概要は参考情報です。

## 必要なもの

- Node.js
- 翻訳・AI Insights 用の OpenAI API key
- Gemini で文字起こしする場合は Gemini API key も必要

## 対応ブラウザ

Chrome、Edge、Firefox、Safari（iOS Safari を含む）の最新版を利用してください。Internet Explorer と古いブラウザは対応していません。

マイク入力には、セキュアコンテキスト（HTTPS または `localhost`）とブラウザでのマイク権限も必要です。

## セットアップ

`.env.local` を作成し、OpenAI API key を設定します。Gemini で文字起こしする場合は Gemini API key も追加します。

```bash
OPENAI_API_KEY=your_api_key
GEMINI_API_KEY=your_gemini_api_key
```

翻訳・AI Insights は文字起こしの設定とは独立して、OpenAI を使います。Gemini の実装も残しています。

依存関係をインストールします。

```bash
npm install
```

開発サーバーを起動します。

```bash
npm run dev
```

ブラウザで以下を開きます。

```txt
http://localhost:3000
```

## 注意点

- ブラウザでマイク権限を許可する必要があります。
- セッションは30分で自動停止します。続ける場合は、再度 `Start` を押してください。
- APIキーはサーバー側でのみ使用され、ブラウザには公開されません。
- OpenAI または Gemini APIの利用料が発生します。

[変更履歴](CHANGELOG.ja.md)
