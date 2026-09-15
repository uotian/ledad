# リアルタイム文字起こし

> ドキュメント全体の索引は[llms.txt](https://developers.openai.com/llms.txt)を参照してください。各ページのURLに`.md`を付けると、Markdown版を取得できます。

音声によるアシスタントの応答を必要とせず、マイク、通話、そのほかのライブ音声ストリームからテキストを取得したい場合は、リアルタイム文字起こしを使用します。推奨モデルは、音声が届くたびに文字起こしの差分を返し、アプリケーションが各発話を確定すると最終的な文字起こしを返します。

まずは[`gpt-live-transcribe`](https://developers.openai.com/api/docs/models/gpt-live-transcribe)を使用してください。録音済みの音声には[ファイルの文字起こし](https://developers.openai.com/api/docs/guides/speech-to-text)を使用します。処理方式を比較するには、[文字起こしの概要](https://developers.openai.com/api/docs/guides/transcription)を参照してください。

## 文字起こしセッションを作成する

`type: "transcription"`でセッションを作成し、`gpt-live-transcribe`を選択します。サーバー側の音声処理には[WebSocket](https://developers.openai.com/api/docs/guides/voice-websockets?api=realtime)、ブラウザの音声には[WebRTC](https://developers.openai.com/api/docs/guides/voice-webrtc?api=realtime)で接続します。

```json
{
  "type": "session.update",
  "session": {
    "type": "transcription",
    "audio": {
      "input": {
        "format": {
          "type": "audio/pcm",
          "rate": 24000
        },
        "transcription": {
          "model": "gpt-live-transcribe"
        },
        "turn_detection": null
      }
    }
  }
}
```

この例では24 kHzのPCM音声を使用します。発話を明示的に確定できるよう、自動的な発話区間の検出を無効にしています。セッション設定の詳細は[Realtimeセッションのリファレンス](https://developers.openai.com/api/reference/resources/realtime/subresources/client_secrets)を参照してください。

## 音声をストリーミングする

`input_audio_buffer.append`で音声チャンクを送信します。

```javascript
ws.send(
  JSON.stringify({
    type: "input_audio_buffer.append",
    audio: base64Pcm16,
  })
);
```

発話区間の自動検出が無効な場合は、発話を終了させたいタイミングでバッファを確定します。

```javascript
ws.send(
  JSON.stringify({
    type: "input_audio_buffer.commit",
  })
);
```

サーバーに発話の区切りを検出・確定させる場合は、代わりに[音声活動検出（VAD）](https://developers.openai.com/api/docs/guides/realtime-vad)を設定します。

## 文字起こしイベントを処理する

文字起こしの差分イベントと完了イベントを受信します。

```javascript
ws.on("message", (data) => {
  const event = JSON.parse(data);

  if (event.type === "conversation.item.input_audio_transcription.delta") {
    process.stdout.write(event.delta);
  }

  if (event.type === "conversation.item.input_audio_transcription.completed") {
    console.log("\nFinal transcript:", event.transcript);
  }
});
```

差分イベントには、新たに取得できた文字起こしテキストが含まれます。

```json
{
  "type": "conversation.item.input_audio_transcription.delta",
  "item_id": "item_003",
  "content_index": 0,
  "delta": "Hello,"
}
```

完了イベントには、確定した項目の最終的な文字起こしが含まれます。

```json
{
  "type": "conversation.item.input_audio_transcription.completed",
  "item_id": "item_003",
  "content_index": 0,
  "transcript": "Hello, how are you?"
}
```

異なる発話の完了イベントが届く順序は保証されません。`item_id`を使い、文字起こしイベントと確定済みの入力項目を対応付けてください。

## 文字起こしの文脈を追加する

音声に専門用語が含まれる場合や、複数の言語が想定される場合は、文脈を追加します。既存のセッション中に設定を変更するには、`session.update`イベントを再度送信します。

```json
{
  "type": "session.update",
  "session": {
    "type": "transcription",
    "audio": {
      "input": {
        "format": {
          "type": "audio/pcm",
          "rate": 24000
        },
        "transcription": {
          "model": "gpt-live-transcribe",
          "prompt": "A customer support call about a premium plan and account AC-42.",
          "keywords": ["premium plan", "AC-42", "billing"],
          "languages": ["en", "fr"],
          "delay": "low"
        },
        "turn_detection": null
      }
    }
  }
}
```

- `prompt`には録音内容や場面の説明を指定します。
- `keywords`には音声に登場しそうな製品名、略語、そのほかの具体的な用語を指定します。
- `languages`には想定される入力言語を指定します。

対応する言語コードの形式には、次のものがあります。

- `en`、`es`、`fr`などのISO 639-1コード。
- `eng`、`spa`、`yue`、`cmn`など、一部のISO 639-3コード。
- `zh-cn`、`zh-tw`、`zh-hk`など、地域別の`zh`ロケールコード。

未対応の言語コードや形式が不正なコードは、Realtime APIによって拒否されます。

キーワードはヒントであり、出力を強制するものではありません。各キーワードは1行に収め、`<`、`>`、復帰文字（CR）、改行文字（LF）を含めないでください。キーワードにこれらの文字が含まれている場合や、`prompt`がモデルの長さ制限を超える場合、Realtime APIはセッションの更新を拒否します。

`gpt-live-transcribe`は、単数形の`language`ではなく`languages`を使用します。両方を送信しないでください。

## 確定済みの発話を文字起こしする

発話を確定してから文字起こしを開始する必要がある場合、または検出された言語の出力が必要な場合に限り、Realtimeセッションで`gpt-transcribe`を使用します。この専用の処理方式にはWebSocket接続が必要です。

`gpt-transcribe`は、Realtime APIセッションの入力文字起こしや専用の文字起こしセッションで動作する際、以前に文字起こしした発話を自動的に文脈として使用します。

```json
{
  "type": "session.update",
  "session": {
    "type": "transcription",
    "audio": {
      "input": {
        "format": {
          "type": "audio/pcm",
          "rate": 24000
        },
        "transcription": {
          "model": "gpt-transcribe"
        },
        "turn_detection": null
      }
    }
  }
}
```

音声を追加し、`input_audio_buffer.commit`を送信します。モデルは最終的な完了イベントの前に文字起こしの差分を出力できます。完了イベントには、検出された言語も含まれます。

```json
{
  "type": "conversation.item.input_audio_transcription.completed",
  "item_id": "item_003",
  "content_index": 0,
  "transcript": "Bonjour, pouvez-vous m'entendre ?",
  "languages": [{ "code": "fr" }]
}
```

`gpt-transcribe`が言語を十分な確度で予測できない場合、`languages`は空の配列になります。`gpt-live-transcribe`は検出言語の予測結果を返しません。

## 遅延と精度を調整する

ストリーミング文字起こしでは、遅延と文字起こし品質の間にトレードオフがあります。遅延の設定を低くすると、途中のテキストをより早く出力できます。高くすると、出力前により多くの音声を文脈として利用でき、単語誤り率の改善が期待できます。

まず`audio.input.transcription.delay`を設定し、実際の音声でテストしてください。初期設定の目安は次のとおりです。

- `minimal`：遅延を最も厳しく抑える必要があるやり取り。
- `low`：低遅延のライブ字幕。
- `medium`：遅延と精度のバランスを取る場合。
- `high`：即時表示より精度を重視する場合。
- `xhigh`：文脈を多く取るために最も長い遅延を許容できる場合。

ミリ秒単位の具体的な遅延はモデルの設定によって変わるため、各段階の待ち時間を固定値と考えず、代表的な音声で測定してください。

合成音声だけで設定を決めないでください。実際に使用するマイク、電話音声、訛り、背景雑音、発話中の言語切り替え、分野固有の語彙、長時間のセッションを含めてテストしてください。

## 信頼度、タイムスタンプ、話者ラベルを扱う

`gpt-live-transcribe`は単語単位のタイムスタンプ、話者ラベル、文字起こしの信頼度スコアを返しません。タイムスタンプや話者ラベルが必要なアプリケーションでは、対応する[ファイル文字起こし](https://developers.openai.com/api/docs/guides/speech-to-text)モデルを使用するか、アプリケーション側に代替手段を追加してください。

## 本番運用のチェックリスト

- 調整を始める前に、目標とする遅延と精度の基準を決める。
- 雑音のないサンプルだけでなく、実際の本番環境の音声でテストする。
- 対象となる各言語でテストする。
- 評価用データに数字、日付、通貨、メールアドレス、製品名、専門用語を含める。
- 単語誤り率とは別に、空の結果、途中で切れた結果、遅延した結果を追跡する。
- 後続の差分で以前のテキストが修正された場合に、UIで途中のテキストをどう更新するか決める。
- `item_id`を使って最終的な文字起こしを並べ替え、対応関係を整合させる。
- 未対応のタイムスタンプ、話者ラベル、信頼度について代替手段を確保する。

## 関連ガイド

- [Realtimeと音声の概要](https://developers.openai.com/api/docs/guides/realtime)：音声エージェント、翻訳、文字起こしの各セッションを比較します。
- [リアルタイム翻訳](https://developers.openai.com/api/docs/guides/realtime-translation)：専用の翻訳セッションでライブ音声を翻訳します。
- [WebSocket接続](https://developers.openai.com/api/docs/guides/voice-websockets?api=realtime)：サーバー側の音声処理を通じて、生の音声をストリーミングします。
- [音声活動検出](https://developers.openai.com/api/docs/guides/realtime-vad)：ライブ音声ストリームの発話区間検出を設定します。
