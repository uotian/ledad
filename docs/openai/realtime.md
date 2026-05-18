# OpenAI Realtime API リファレンス読解メモ

参照元:

- [Realtime API Reference](https://developers.openai.com/api/reference/resources/realtime)
- [Realtime transcription guide](https://developers.openai.com/api/docs/guides/realtime-transcription)
- [Realtime API with WebRTC](https://developers.openai.com/api/docs/guides/realtime-webrtc)

このファイルは公式リファレンスの逐語訳ではなく、実装時に参照しやすいように日本語で再整理したメモです。特にこのアプリで使う `gpt-realtime-whisper` と WebRTC transcription session を中心に読む。

## 全体像

Realtime API は、クライアントとOpenAIサーバーがイベントを送り合うAPI。接続方式は WebRTC、WebSocket、SIP などがあり、ブラウザから低遅延の音声を扱う場合は WebRTC が向いている。

このアプリでは、ブラウザで作った WebRTC offer SDP をサーバーへ送り、サーバー側で OpenAI の `/v1/realtime/calls` に中継して answer SDP を受け取っている。

送信の形は multipart/form-data:

```text
sdp: WebRTC offer SDP
session: JSON string
```

`session` のJSONが Realtime セッションの設定本体。

## セッションの種類

Realtime API の session は大きく2種類ある。

### Realtime session

音声会話エージェント向け。`type` は `realtime`。

音声入力をモデルが直接理解し、必要に応じて音声やテキストで応答する。`gpt-realtime-2` のような音声エージェントモデルを使う場合はこちら。

```ts
{
  type: "realtime",
  model: "gpt-realtime-2",
  audio: {
    input: {},
    output: {}
  }
}
```

### Transcription session

文字起こし専用。`type` は `transcription`。

このアプリの用途はこちら。音声をリアルタイムに文字へ変換し、`conversation.item.input_audio_transcription.delta` などのイベントを受け取る。

```ts
{
  type: "transcription",
  audio: {
    input: {
      format: {
        type: "audio/pcm",
        rate: 24000
      },
      transcription: {
        model: "gpt-realtime-whisper",
        language: "en"
      }
    }
  }
}
```

## Transcription session のパラメータ

公式リファレンス上の中心になる型は `RealtimeTranscriptionSessionCreateRequest`。

大枠:

```ts
type RealtimeTranscriptionSessionCreateRequest = {
  type: "transcription";
  audio?: RealtimeTranscriptionSessionAudio;
  include?: Array<"item.input_audio_transcription.logprobs">;
};
```

### type

transcription session では常に:

```ts
type: "transcription"
```

### audio.input.format

入力音声フォーマット。

このアプリは WebRTC 経由だが、session JSON では以下を指定している。

```ts
format: {
  type: "audio/pcm",
  rate: 24000
}
```

API Reference では transcription session response の説明として、PCM は 24kHz のみ対応とされている。

### audio.input.transcription

文字起こしモデルの設定。

```ts
transcription: {
  model: "gpt-realtime-whisper",
  language: "en",
  prompt?: string
}
```

#### model

文字起こしに使うモデル。

このアプリでは:

```ts
model: "gpt-realtime-whisper"
```

`gpt-realtime-whisper` は Realtime transcription guide で示されているリアルタイム文字起こし用モデル。API Reference の列挙や説明が新機能に追いついていない箇所があるため、モデル名については Realtime transcription guide と Models ページも合わせて確認する。

#### language

入力音声の言語。ISO系の短いコードを渡す。

このアプリでは `en`, `ja`, `zh`, `fr` を扱っている。

```ts
language: langFrom
```

#### prompt

文字起こしモデルへの補助ヒント。固有名詞、専門用語、表記方針などを伝える用途。

まだこのアプリでは使っていない。

### audio.input.noise_reduction

入力音声のノイズ低減設定。`near_field` はヘッドセットなど近距離マイク、`far_field` はPC内蔵マイクや会議室マイクのような遠距離音声向け。

`null` にするとオフにできる。

このアプリではまだ未指定。

### audio.input.turn_detection

発話区切り検出の設定。

リファレンス上は transcription session でも `server_vad` が説明されている。意味としては、音量ベースで発話開始・終了をサーバー側が検出する仕組み。

代表的なフィールド:

```ts
turn_detection: {
  type: "server_vad",
  prefix_padding_ms?: number,
  silence_duration_ms?: number,
  threshold?: number
}
```

- `prefix_padding_ms`: 発話開始検出前の音声をどれくらい含めるか
- `silence_duration_ms`: 無音が何ms続いたら発話終了とみなすか
- `threshold`: 発話検出の音量しきい値

ただし、2026-05-17時点で実APIに `gpt-realtime-whisper` と `turn_detection: { type: "server_vad" }` を組み合わせて投げると、`Turn detection is not supported for this transcription model.` というエラーが返った。したがってこのアプリでは現時点で `turn_detection` を指定しない方針。

## include

追加でサーバー出力に含めたいフィールドを指定する。

```ts
include: ["item.input_audio_transcription.logprobs"]
```

これを有効にすると、文字起こしdeltaなどに `logprobs` が含まれる。候補トークンの確からしさを見たいときに使う。通常の字幕・翻訳用途では不要。

## クライアントイベント

クライアントからサーバーに送るイベント。WebRTCでは DataChannel 経由で送る。

このアプリでは今のところ明示的な client event はほぼ送っていない。WebRTC の音声トラック自体が入力音声として流れている。

### input_audio_buffer.append

音声バッファに音声データを追加するイベント。WebSocketでbase64音声を送るときに使うことが多い。

WebRTCでは音声トラックを送っているため、このアプリでは直接使っていない。

### input_audio_buffer.commit

現在の入力音声バッファを確定し、会話内に新しい user message item を作るイベント。

重要な性質:

- 空のバッファに対して送るとエラーになる
- Server VAD が有効な場合、クライアントから送る必要はない
- commit すると、文字起こしが有効な場合は transcription が走る
- commit 自体はモデル応答を作らない
- サーバーは `input_audio_buffer.committed` を返す

このアプリで注意すべき点:

- `delta: "."` は「文が切れそう」というテキスト上のシグナル
- `input_audio_buffer.commit` は「音声バッファを確定する」制御イベント
- この2つは同じ意味ではない
- 今の `gpt-realtime-whisper` 実装では、文末記号を見てアプリ側で表示Itemを区切るほうが自然

### input_audio_buffer.clear

入力音声バッファを消す。サーバーからは `input_audio_buffer.cleared` が返る。

## サーバーイベント

サーバーからDataChannelなどで届くイベント。

このアプリで重要なのは以下。

### session.created

セッション作成時に届く。サーバーが受理したセッション設定を確認できる。

見るべき点:

- `session.type`
- `session.audio.input.format`
- `session.audio.input.transcription.model`
- `session.audio.input.turn_detection`

### session.updated

`session.update` や初期化後の有効設定を示すイベント。実際に有効になった設定を見るのに使える。

今回のように新しいモデルを使う場合は、`session.updated` に `gpt-realtime-whisper` が反映されているかを見るとよい。

### conversation.item.input_audio_transcription.delta

入力音声の文字起こしが増分で更新されたときに届く。

実際のpayload例:

```ts
{
  type: "conversation.item.input_audio_transcription.delta",
  event_id: "event_...",
  item_id: "item_...",
  content_index: 0,
  delta: " that"
}
```

フィールドの意味:

- `event_id`: このイベント自体のID。deltaイベントごとに変わる
- `item_id`: 文字起こし対象の音声Item ID。長いストリームで同じまま続くことがある
- `content_index`: item内のcontent配列の位置。何文目かではない
- `delta`: 追加されたテキスト本体
- `logprobs`: includeで有効化した場合の確率情報

このアプリでは `delta` が一番重要。`delta` を連結してリアルタイム表示する。

観測上、句読点が単独で来ることがある。

```ts
{ delta: "." }
{ delta: "?" }
```

そのため、文区切りは `delta` が句読点単独かどうかで判断できる可能性が高い。

### conversation.item.input_audio_transcription.completed

入力音声の文字起こしが確定したときに届くイベント。

主なフィールド:

- `event_id`
- `item_id`
- `content_index`
- `transcript`
- `usage`

`transcript` に確定全文が入る。

ただし、今の `gpt-realtime-whisper` + WebRTC transcription session では、自然に `completed` が来ず、`delta` が継続して流れ続ける挙動を確認している。そのため、このアプリでは `completed` だけを待つ実装は避ける。

### conversation.item.input_audio_transcription.failed

文字起こしに失敗したときのイベント。

通常の `error` イベントとは別で、どの item に関係する失敗かを判断できる。

見るべき点:

- `item_id`
- `content_index`
- `error.message`
- `error.code`
- `error.param`

### input_audio_buffer.committed

`input_audio_buffer.commit` に対するサーバー応答。

commit によって作られた user message item に関するIDが返る。

このアプリでは現時点で手動commitを使わない方針なので、通常は見ない。

### input_audio_buffer.cleared

`input_audio_buffer.clear` に対するサーバー応答。

### error

イベント処理やパラメータ不正などでサーバーが返すエラー。

アプリ側では握りつぶさず、HTTPステータスやサーバー本文を見えるようにする。

## content_index の読み方

`content_index` は「何文目か」ではない。

意味は、対象 item の `content` 配列の何番目か。

イメージ:

```ts
item.content[0]
```

音声入力contentが1つだけなら、`content_index` はずっと `0` で自然。

文ごとに表示したい場合、`content_index` に頼らず、アプリ側で文単位のItemを作る。

## item_id と event_id の読み方

### event_id

サーバーイベント1つごとのID。deltaが1語ずつ来るなら、各deltaごとに変わる。

重複ログの確認やデバッグには使えるが、表示行のIDには向かない。

### item_id

OpenAI側の会話Item ID。文字起こし対象の音声Itemを指す。

今回の観測では、長い文字起こしストリームで同じ `item_id` が継続していた。そのため、`item_id` をUIの1行IDにすると、1行が延々伸び続ける。

このアプリでは OpenAI の `item_id` ではなく、アプリ側で文ごとの表示Itemを作るほうが自然。

## obfuscation について

実際のpayloadには `obfuscation` が含まれることがある。

ただし、API Reference の `conversation.item.input_audio_transcription.delta` の主要な説明項目には `obfuscation` は出ていない。アプリ制御に使う値ではなく、不透明な補助メタデータとして無視する。

文区切り、順序、重複判定には使わない。

## このアプリでの設計メモ

現在の観測:

- WebRTC接続は成功している
- `session.created` と `session.updated` が届く
- `conversation.item.input_audio_transcription.delta` が継続的に届く
- `item_id` は長く同じまま
- `content_index` は `0`
- `completed` は自然には来ていない
- `delta: "."` のように句読点が単独で来る

したがって、今後の実装方針は以下がよい。

### 表示

`delta` をアプリ側の現在文バッファへ追記する。

```ts
currentTranscript += event.delta;
```

文末deltaが来たら、その文を確定Itemにする。

```ts
const sentenceEndDeltas = new Set([".", "?", "!", "。", "？", "！"]);
```

`delta` がこの集合に含まれたら、次のdeltaからは新しい表示Itemにする。

### 翻訳

文末deltaで確定した文だけ翻訳に回す。

`completed` は、もし来たら補正・確定に使う程度にする。`completed` が来る前提にはしない。

### ID

OpenAI の `item_id` をUI Item IDとして使わない。

アプリ側で文ごとにIDを作る。

```ts
crypto.randomUUID()
```

または連番でもよい。

### commit

`delta: "."` が来たからといって `input_audio_buffer.commit` を送る必要はない。

`commit` は音声バッファ確定の制御イベントであり、文表示の区切りとは別物。今の用途では、まずdeltaをアプリ側で区切る。

## 現在の最小セッション設定

このアプリで使う最小構成:

```ts
{
  type: "transcription",
  audio: {
    input: {
      format: {
        type: "audio/pcm",
        rate: 24000
      },
      transcription: {
        model: "gpt-realtime-whisper",
        language: langFrom
      }
    }
  }
}
```

`turn_detection` は現時点では付けない。実APIで `gpt-realtime-whisper` と組み合わせたときに拒否されることを確認済み。

## 実装時に見るイベント

デバッグ時は `onMessage` で以下を確認する。

```ts
console.log("[realtime:event]", event);
```

特に見るもの:

- `event.type`
- `event.delta`
- `event.transcript`
- `event.item_id`
- `event.content_index`
- `event.error`

## 未解決・要観測

- `gpt-realtime-whisper` で `completed` を自然に発生させる公式推奨の区切り方法
- `turn_detection` がモデル側で今後サポートされるか
- `delta: " U.S."` のような略語がどの粒度で来るか
- 日本語・中国語で句読点deltaがどう届くか
- `logprobs` を有効化した場合に翻訳や分割に使えるか
