# Gemini API 設計

確認日：2026-11-07。JavaScript／TypeScript の Google Gen AI SDK `@google/genai` 3系を使用し、ロックファイルで3.0.0に固定する。

## 利用箇所とAPIバージョン

| 処理 | 実装 | モデル | API・接続先 |
| --- | --- | --- | --- |
| 単文翻訳・分割翻訳・AI Insights | `src/ai/gemini/{translate,translate-many,insights}.ts` → `generate.ts` | `gemini-3.8-flash` | SDK、`POST /v1/interactions` |
| 録音のアップロード・削除 | `src/ai/gemini/transcribe.ts` | なし | REST、`POST /upload/v1/files`、`DELETE /v1/files/{id}` |
| 録音ファイルの文字起こし | `src/ai/gemini/transcribe.ts` | `gemini-3.5-transcribe` | SDK、`POST /v1beta/interactions` |
| Live一時トークンの発行 | `src/ai/gemini/transcribe-live.ts` | `gemini-3.5-transcribe-live` に制約 | SDK、`POST /v1beta/auth_tokens` |
| ブラウザのLive文字起こし | `src/hooks/use-session/actions/start/flush/gemini/index.ts` | `gemini-3.5-transcribe-live` | WebSocket、`google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContentConstrained` |

HTTPのホストは `https://generativelanguage.googleapis.com`、WebSocketは同ホストの `wss://…/ws/`。SDKクライアントは `apiVersion`、`vertexai: false`、`httpOptions.baseUrl` を明示し、APIバージョン・Vertex AI・接続先の環境設定で切り替わらないようにする。

画面で選べるプロバイダーは速報のSTTのみ。確定版STT・翻訳・AI Insightsの画面からの呼び出しは引き続きOpenAIを使用する。Gemini版も既存の `/api/transcribe/gemini`、`/api/translate/gemini`、`/api/translate/gemini/many`、`/api/insights/gemini` の経路で提供しているため、SDK移行の対象に含める。

Geminiを呼ぶ独立スクリプト、Pythonなど別言語の実装・SDK依存、Vertex AI、音声生成、`latest` モデル名はリポジトリ内にない。モデルIDは既存の具体的なIDを維持する。

## v1へ移行した機能

- 翻訳・要約のInteractions API：`system_instruction`、`response_format` のJSON Schema、`thinking_level: "low"`、`max_output_tokens: 8000`、`store: false` は現行のv1仕様に含まれる。`gemini-3.8-flash` は `low` をサポートする。
- Filesサービス：アップロードと削除のルートはv1対応。既存の再開可能アップロードを残し、サーバーから返るアップロード先がHTTPSかつ `.googleapis.com` 配下であることを確認してから音声を送る。SDKのアップロード処理へ置き換えてこの検証を失わないようにする。

## v1betaを残す理由

- 録音の文字起こし：`generation_config.transcription_config` はv1betaの仕様にあり、v1の仕様には含まれない。`language_codes`、`custom_vocabulary`、`mode: { type: "verbatim" }` を維持するため、このInteractions呼び出しだけをv1betaにする。モデルがv1で利用できることと専用パラメーターが使えることは別に確認する。
- Live文字起こしと一時トークン：公式の対応表・一時トークンの説明でv1beta限定。モデル、出力 `TEXT`、言語・語彙、`VERBATIM`、VADの感度と100msの無音判定を維持する。PCMは従来の24kHzを送り、MIMEにも同じレートを指定する。
- ブラウザのWebSocketは直接接続を維持する。共有の `connectSocket` にある初期接続のタイムアウト・キャンセル・切断処理と、送信待ち音声の `bufferedAmount` による停止判定を保つため、今回SDKのLiveセッションへは置き換えない。

一時トークンはサーバーのSDK `authTokens.create` で発行する。`liveConnectConstraints` は送信時に `bidiGenerateContentSetup` に変換される。従来と同じく `fieldMask` は省略し、トークンの設定を優先する。利用回数1回、接続開始期限1分、メッセージ受付期限11分を維持する。ブラウザには一時トークンだけを返し、APIキーはサーバー内に留める。

## エラー処理とデータ保護

- 翻訳・要約は60秒の期限、429／503に対する最大2回の再試行、`Retry-After` と日次上限判定を維持する。SDK内部の再試行を無効にして回数が増えないようにし、停止時のキャンセルをSDKにも渡す。
- Interactionsの自動継続を無効にし、不完全な結果を成功として扱わない。翻訳・要約のJSON検証は呼び出し側で続ける。SDKの内部エラー本文や認証情報を画面へ返さない。
- 録音ファイルは文字起こしの成否にかかわらず `finally` で削除を試みる。削除の通信失敗で文字起こし結果を失わない従来の扱いを維持する。
- 録音ファイルのSDK呼び出しでは、リクエスト・レスポンス全文の従来のデバッグログを廃止する。既存のブラウザ設定・会話データ・APIキーの保存方法は変更しない。

## 開発・検証

Node.js 22以上が必須。`package.json` の `engines` と `.npmrc` で制約を適用し、nvmとCIは `.nvmrc` の22系を使う。Nodeの型定義も22系に揃える。

SDK自体はモックにせず、Node環境でHTTP通信のみを差し替えて送信先・ヘッダー・モデル・JSON設定・APIバージョンを検証する。録音を受け付けるAPIのテストもNodeのFile／FormData／Requestを使う。Liveは既存のWebSocket代替を使い、v1betaの接続先、音声送信、切断・再接続と停止を検証する。`GOOGLE_GENAI_API_VERSION`、`GOOGLE_GENAI_USE_VERTEXAI`、`GOOGLE_GEMINI_BASE_URL` が設定されても送信先が変わらないことも確認する。

実行する確認：`npm run typecheck`、`npm run lint`、`npm test`、`npm run build`。これらは実APIの疎通や認識精度、実マイクでの遅延を保証しない。実API・実機の確認状況は作業完了時に別途報告する。

2026-11-07の移行確認では、Node.js 22.16.0と24.22.1で全261テストが成功。続く依存更新後もNode.js 22.16.0で全263テストとビルドが成功し、型チェック・lintも成功した。依存関係とロックファイルの一致、および `npm ci --dry-run` を確認した。実API・実マイク・リモートCIは未確認。

依存監査で見つかったCritical 2件を含む依存関係を更新し、`npm audit --omit=dev` は0件になった。開発依存には未修正の `deepmerge` に由来するLow 3件が残るため、shadcnの起動時だけ回避策を適用する。更新内容・残存理由・実行方法は [依存関係のセキュリティ](dependency-security.md) を参照。本アプリはMCP機能を使用しない。

## 公式資料

- [Google Gen AI SDK v3.0.0](https://github.com/googleapis/js-genai/releases/tag/v3.0.0)：既定APIとNode.js要件。対応表のSDK既定値の説明には旧情報が残るため、SDK 3の既定値はこのリリースを基準にする。
- [APIバージョン対応表](https://ai.google.dev/gemini-api/docs/api-versions)：Interactions・構造化出力・思考・Filesはv1、Live・一時トークンはv1beta。
- [Interactions v1](https://ai.google.dev/api/interactions-api-v1)／[v1beta](https://ai.google.dev/api/interactions-api)：利用パラメーターと `transcription_config` の有無。
- [Gemini 3.8 Flash](https://ai.google.dev/gemini-api/docs/models/gemini-3.8-flash)／[思考設定](https://ai.google.dev/gemini-api/docs/thinking)：モデルと `low` の対応。
- [録音の文字起こし](https://ai.google.dev/gemini-api/docs/transcribe)／[Live文字起こし](https://ai.google.dev/gemini-api/docs/live-api/live-transcribe)：言語コード・語彙最大1,000件・逐語モード・PCMのレート指定。
- [一時トークン](https://ai.google.dev/gemini-api/docs/ephemeral-tokens)／[Files](https://ai.google.dev/gemini-api/docs/files)：トークン制約・アップロードと削除。
