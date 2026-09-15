# リアルタイム文字起こし

> **注:** この文書は以前の `gpt-realtime-whisper` 構成について説明しています。現在の `gpt-live-transcribe` については、[リアルタイム文字起こしの概要](./realtime-transcription-summary.jp.md)を参照してください。

アプリケーションで、音声によるアシスタントの応答を必要とせず、ライブ音声をテキストに変換したい場合は、リアルタイム文字起こしを使用します。リアルタイム文字起こしセッションでは、音声の到着に合わせて文字起こしの差分がストリーミングされるため、発話全体が完了する前からユーザーにテキストを表示できます。

最も低遅延なストリーミング文字起こしには、[`gpt-realtime-whisper`](https://developers.openai.com/api/docs/models/gpt-realtime-whisper) を使用します。オフラインファイルや、差分のストリーミングを必要としないワークフローでは、Audio APIの標準的な音声テキスト化モデルを使用してください。

## 文字起こしモデルを選ぶ

<table>
  <thead>
    <tr>
      <th>モデル</th>
      <th>適した用途</th>
      <th>備考</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td className="whitespace-nowrap">
        <a href="/api/docs/models/gpt-realtime-whisper">
          gpt-realtime-whisper
        </a>
      </td>
      <td>ライブ音声、文字起こし差分、調整可能な遅延。</td>
      <td>ネイティブなストリーミングに対応し、リアルタイムセッション向けに設計されています。</td>
    </tr>
    <tr>
      <td className="whitespace-nowrap">
        <a href="/api/docs/models/gpt-4o-transcribe">gpt-4o-transcribe</a>
      </td>
      <td>ストリーミングが不要で、より高精度な音声テキスト化が必要な場合。</td>
      <td>ファイルやリクエスト・レスポンス形式の文字起こしワークフローで使用します。</td>
    </tr>
    <tr>
      <td className="whitespace-nowrap">
        <a href="/api/docs/models/gpt-4o-mini-transcribe">
          gpt-4o-mini-transcribe
        </a>
      </td>
      <td>低コストな文字起こし。</td>
      <td>最高精度よりもコストを重視する場合に使用します。</td>
    </tr>
    <tr>
      <td className="whitespace-nowrap">
        <a href="/api/docs/models/whisper-1">whisper-1</a>
      </td>
      <td>既存のWhisper連携。</td>
      <td>
        <code>gpt-realtime-whisper</code> と同じ方式のネイティブなストリーミングには対応していません。
      </td>
    </tr>
  </tbody>
</table>

`gpt-realtime-whisper` はライブ文字起こしのための選択肢であり、すべての文字起こしモデルを一律に置き換えるものではありません。本番トラフィックを切り替える前に、実際の音声、言語、語彙、遅延要件に対してテストしてください。

## 文字起こしセッションを作成する

リアルタイム文字起こしでは、`type: "transcription"` を指定したセッションを使用します。サーバー側の音声パイプラインには [WebSocket](https://developers.openai.com/api/docs/guides/realtime-websocket)、ブラウザの音声には [WebRTC](https://developers.openai.com/api/docs/guides/realtime-webrtc) で接続できます。

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
          "model": "gpt-realtime-whisper",
          "language": "en"
        }
      }
    }
  }
}
```


### セッションフィールド

- `type`: 文字起こし専用のセッションでは `transcription` を指定します。
- `audio.input.format`: バッファーに追加する音声の入力エンコーディングです。`audio/pcm` を送信する場合は、24 kHzのモノラルPCMを使用します。
- `audio.input.transcription.model`: ストリーミング文字起こしには `gpt-realtime-whisper` を使用します。
- `audio.input.transcription.language`: `en` などの言語ヒントを任意で指定できます。
- `audio.input.transcription.delay`: `gpt-realtime-whisper` における遅延と精度のトレードオフを任意で指定します。指定可能な値は `minimal`、`low`、`medium`、`high`、`xhigh` です。
- `audio.input.turn_detection`: 対応モデルでは、音声区間検出を任意で指定できます。`gpt-realtime-whisper` ではこのフィールドを省略するか `null` に設定し、その後、音声を手動でコミットします。

## 音声をストリーミングする

`input_audio_buffer.append` で音声チャンクを送信します。

```javascript
ws.send(
  JSON.stringify({
    type: "input_audio_buffer.append",
    audio: base64Pcm16,
  })
);
```


発話区間検出を無効にした場合は、文字起こしを開始したいタイミングでバッファーをコミットします。

```javascript
ws.send(
  JSON.stringify({
    type: "input_audio_buffer.commit",
  })
);
```


サーバーVADに対応しているモデルでは、セッションが発話の区切りを検出したときに、音声が自動的にコミットされます。

## 文字起こしイベントを処理する

文字起こしの増分差分イベントと完了イベントを監視します。

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


差分イベントには、新たに利用可能になった文字起こしテキストが含まれます。

```json
{
  "type": "conversation.item.input_audio_transcription.delta",
  "item_id": "item_003",
  "content_index": 0,
  "delta": "Hello,"
}
```

完了イベントには、コミットされた項目の最終的な文字起こし結果が含まれます。

```json
{
  "type": "conversation.item.input_audio_transcription.completed",
  "item_id": "item_003",
  "content_index": 0,
  "transcript": "Hello, how are you?"
}
```

異なる発話ターンの完了イベントが届く順序は保証されません。`item_id` を使用して、文字起こしイベントとコミット済みの入力項目を対応付けてください。

## 遅延と精度を調整する

ストリーミング文字起こしでは、遅延と文字起こし品質の間にトレードオフがあります。低い `delay` 設定では部分的なテキストをより早く出力できます。高い設定では、テキストを出力する前にモデルが参照できる音声コンテキストが増えるため、単語誤り率が改善する可能性があります。

まず `audio.input.transcription.delay` を設定し、実際の音声でテストしてください。開始時の目安は次のとおりです。

- `minimal`: 遅延を最小限にする必要がある対話向け
- `low`: 低遅延のライブ字幕向け
- `medium`: 遅延と精度のバランスを取る場合
- `high`: 即時表示よりも精度を重視する場合
- `xhigh`: 追加のコンテキストを得るために、最大の遅延を許容できるワークフロー向け

実際の遅延時間はモデル構成によって変わるため、各レベルに固定された時間を想定せず、代表的な音声を使ってベンチマークしてください。

合成音声だけで設定を選ばないでください。実際に使用するマイク、電話音声、アクセント、背景ノイズ、コードスイッチング、専門用語、長時間のセッションを使ってテストします。

## 語彙や専門用語を補助する

アプリケーションで専門用語を正確に扱う必要がある場合は、言語ヒントを指定し、選択したモデルが対応している場合に限り、プロンプトやキーワードによる誘導を使用してください。GA版Realtimeセッションの `gpt-realtime-whisper` では、`prompt` はサポートされていません。

プロンプトによる誘導を利用できる場合は、長い指示ではなく短いキーワード一覧を使用します。モデルにはすでに文字起こしを行うよう指示されているため、文字起こしタスク自体を繰り返し説明せず、専門用語、綴り、スタイルに焦点を当ててください。

キーワード形式の例：

```text
Keywords: metoprolol, atorvastatin, A1C, systolic, diastolic
```

本番環境では、キーワードによる誘導を補助として扱い、結果が保証されるとは考えないでください。氏名、数値、日付、薬品名、製品名、アーティスト名など、重要度の高い固有表現は引き続き手動で評価してください。

## 信頼度、タイムスタンプ、話者分離を扱う

選択したモデルとエンドポイントが対応している任意フィールドだけをリクエストしてください。アプリケーションで信頼度スコア、タイムスタンプ、話者分離が必要な場合は、リリース前にサポート状況を確認し、利用できないフィールドに対するフォールバックを追加します。

対数確率を利用できる場合は、`include` でリクエストします。

```json
{
  "type": "session.update",
  "session": {
    "type": "transcription",
    "audio": {
      "input": {
        "transcription": {
          "model": "gpt-realtime-whisper"
        }
      }
    },
    "include": ["item.input_audio_transcription.logprobs"]
  }
}
```


## 本番環境のチェックリスト

- 調整を始める前に、目標とする遅延と精度の基準を決めます。
- クリーンなサンプルだけでなく、本番環境を想定した実際の音声でテストします。
- 対象となる各言語をテストします。
- 評価用データには、数値、日付、通貨、メールアドレス、製品名、専門用語を含めます。
- 空の文字起こし、途中で切れた文字起こし、遅延した文字起こしを、単語誤り率とは分けて追跡します。
- 後続の差分で先行する部分テキストが修正された場合に、UIでどのように更新するかを決めます。
- `item_id` を使用して、最終的な文字起こし結果の順序を整え、対応付けます。
- 未対応のタイムスタンプ、話者分離、信頼度フィールドに備え、フォールバック経路を用意します。

## 関連ガイド

<a href="/api/docs/guides/realtime">


<span slot="icon">
      </span>
    音声エージェント、翻訳、文字起こしセッションを比較します。


</a>

<a href="/api/docs/guides/realtime-translation">


<span slot="icon">
      </span>
    専用の翻訳セッションを使用して、ライブ音声を翻訳します。


</a>

<a href="/api/docs/guides/realtime-websocket">


<span slot="icon">
      </span>
    サーバー側のメディアパイプラインを通じて、生の音声をストリーミングします。


</a>

<a href="/api/docs/guides/realtime-vad">


<span slot="icon">
      </span>
    ライブ音声ストリームの発話区間検出を設定します。


</a>
