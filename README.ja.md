# ledad

[日本語](README.ja.md) | [English](README.md) | [Français](README.fr.md) | [中文](README.zh.md)

![ledadのリアルタイム文字起こし・翻訳・AI Insightsデモ](docs/assets/ledad-demo.gif)

サンプルデータによる操作デモ

ブラウザのマイク入力を使って、音声をリアルタイムに文字起こし・翻訳し、AI Insightsで会話の話題を要約するWebアプリです。

使用技術：Next.js 16、React 19、TypeScript、OpenAI API

## 主な機能

- ブラウザでのマイク入力
- 低遅延な速報版と60秒ごとの確定版文字起こし
- 速報版・確定版の翻訳
- 話題ごとの概要と現在の話題を、入力言語で表示
- 入力言語・翻訳先言語の切り替え
- セッションの開始・停止・クリア

## 使い方

画面右上の歯車アイコン（`Settings`）を押し、以下を設定して `Save` を押します。設定は利用中のブラウザに保存されます。

- `Source language`／`Translation language`：英語（`en`）・日本語（`ja`）・中国語（`zh`）・フランス語（`fr`）から選びます。初期値は英語→日本語です。画面下部のコントロールパネルには、選択した翻訳方向が表示されます。
- `Transcription`：OpenAI を使います。
- `Text size`：S／M／Lから選びます（初期値：M）。
- `Prompt`：OpenAI の文字起こしに使う話題や録音の背景を入力します。
- `Keywords`：固有名詞・専門用語・略語など、表記のヒントを1行に1つ入力します。

`idle` 以外で設定を開くと、セッションを停止するか確認します。`Text size` は保存後すぐに反映され、それ以外の設定は次のセッション開始時に有効になります。

`Stop` を押すと、マイク入力とRealtime接続を停止します。

OpenAI は15秒ごとに音声バッファを確定し、翻訳を自動更新します。

メインパネル右下の消しゴムアイコン（`Clear`）を押すと、表示中の履歴を消去します。セッションは停止しません。

メインパネル左側の `AI Insights` にある `All Topics` は同じ話題をまとめた一覧、`Current Topic` は現在の話題です。タイトルを押すと概要を展開します。狭い画面では書き起こしの上に表示します。

会話中は1分ごとに変更を確認し、表示中の書き起こし・翻訳を `gpt-6-luna` で要約します。概要は翻訳先の言語で表示されます。横の更新ボタンからは、内容が同じでも再生成できます。処理中はボタンが無効になり、停止後も最後の概要を表示します。概要は参考情報です。

## 必要なもの

- Node.js
- OpenAI API key

## 対応ブラウザ

Chrome、Edge、Firefox、Safari（iOS Safari を含む）の最新版を利用してください。Internet Explorer と古いブラウザは対応していません。

マイク入力には、セキュアコンテキスト（HTTPS または `localhost`）とブラウザでのマイク権限も必要です。

## セットアップ

`.env.local` を作成し、OpenAI API key を設定します。

```bash
OPENAI_API_KEY=your_api_key
```

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
- OpenAI APIキーはサーバー側でのみ使用され、ブラウザには公開されません。
- OpenAI APIの利用料が発生します。

[変更履歴](CHANGELOG.ja.md)
