# ledad

[日本語](README.ja.md) | [English](README.md) | [Français](README.fr.md) | [中文](README.zh.md)

![ledadのリアルタイム文字起こし・翻訳デモ](docs/assets/ledad-demo.gif)

サンプルデータによる操作デモ

ブラウザのマイク入力を使って、音声をリアルタイムに文字起こしし、別言語へ翻訳するWebアプリです。

## 仕組み

ブラウザからWebRTCでOpenAI Realtime APIへ音声を送り、低遅延な速報版を生成します。同時に同じ音声を60秒単位で録音し、`gpt-transcribe` へ送って高精度な確定版を生成します。完了した速報は同じタイムライン上で確定版に置き換わり、最新の未確定部分は速報のまま表示されます。OpenAI APIキーはサーバー側でのみ扱います。

使用技術：Next.js 16、React 19、TypeScript、OpenAI Realtime API／Responses API

## 主な機能

- ブラウザでのマイク入力
- 低遅延な速報版と60秒ごとの確定版文字起こし
- 速報版・確定版の翻訳
- 入力言語・翻訳先言語の切り替え
- セッションの開始・停止・Commit・クリア

## 使い方

画面右上の歯車アイコン（`Settings`）を押し、以下を設定して `Save` を押します。設定は利用中のブラウザに保存されます。

- `Source language`／`Translation language`：英語（`en`）・日本語（`ja`）・中国語（`zh`）・フランス語（`fr`）から選びます。初期値は英語→日本語です。画面下部のコントロールパネルには、選択した翻訳方向が表示されます。
- `Text size`：S／M／Lから選びます（初期値：M）。
- `Prompt`：話題や録音の背景など、文字起こしのための文脈を入力します。
- `Keywords`：固有名詞・専門用語・略語など、表記のヒントを1行に1つ入力します。

`idle` 以外で設定を開くと、セッションを停止するか確認します。`Text size` は保存後すぐに反映され、それ以外の設定は次のセッション開始時に有効になります。

`Stop` を押すと、マイク入力とRealtime接続を停止します。

`Commit` を押すと、現在の音声バッファを確定し、表示中の文字起こしを翻訳します。セッション中は、音声バッファも15秒ごとに自動で確定されます。

メインパネル右下の消しゴムアイコン（`Clear`）を押すと、表示中の履歴を消去します。セッションは停止しません。

## 必要なもの

- Node.js
- OpenAI API key

## 対応ブラウザ

Chrome、Edge、Firefox、Safari（iOS Safari を含む）の最新版を利用してください。Internet Explorer と古いブラウザは対応していません。

マイク入力には、セキュアコンテキスト（HTTPS または `localhost`）とブラウザでのマイク権限も必要です。

## セットアップ

`.env.local` を作成し、OpenAI API keyを設定します。

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
- OpenAI APIの利用料が発生します。

[変更履歴](CHANGELOG.ja.md)
