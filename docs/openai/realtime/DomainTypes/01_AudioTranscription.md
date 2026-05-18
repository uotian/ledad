# Audio Transcription

- `AudioTranscription object { delay, language, model, prompt }`

  - `delay: optional "minimal" or "low" or "medium" or 2 more`

    モデルが文字起こしテキストを出力する前に、どれくらい待つかを制御します。
    値を大きくすると、レイテンシと引き換えに文字起こし精度が向上する場合があります。
    GA版 Realtime セッションでは、`gpt-realtime-whisper` でのみサポートされます。

    - `"minimal"`

    - `"low"`

    - `"medium"`

    - `"high"`

    - `"xhigh"`

  - `language: optional string`

    入力音声の言語です。入力言語を [ISO-639-1](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes) 形式、たとえば `en` のように指定すると、精度とレイテンシが改善されます。

  - `model: optional string or "whisper-1" or "gpt-4o-mini-transcribe" or "gpt-4o-mini-transcribe-2025-12-15" or 3 more`

    文字起こしに使うモデルです。現在の選択肢は `whisper-1`、`gpt-4o-mini-transcribe`、`gpt-4o-mini-transcribe-2025-12-15`、`gpt-4o-transcribe`、`gpt-4o-transcribe-diarize`、`gpt-realtime-whisper` です。話者ラベル付きの話者分離が必要な場合は、`gpt-4o-transcribe-diarize` を使います。

    - `string`

    - `"whisper-1" or "gpt-4o-mini-transcribe" or "gpt-4o-mini-transcribe-2025-12-15" or 3 more`

      文字起こしに使うモデルです。現在の選択肢は `whisper-1`、`gpt-4o-mini-transcribe`、`gpt-4o-mini-transcribe-2025-12-15`、`gpt-4o-transcribe`、`gpt-4o-transcribe-diarize`、`gpt-realtime-whisper` です。話者ラベル付きの話者分離が必要な場合は、`gpt-4o-transcribe-diarize` を使います。

      - `"whisper-1"`

      - `"gpt-4o-mini-transcribe"`

      - `"gpt-4o-mini-transcribe-2025-12-15"`

      - `"gpt-4o-transcribe"`

      - `"gpt-4o-transcribe-diarize"`

      - `"gpt-realtime-whisper"`

  - `prompt: optional string`

    モデルのスタイルを誘導したり、前の音声セグメントからの続きを補助したりするための任意のテキストです。
    `whisper-1` では、[prompt はキーワードのリスト](/docs/guides/speech-to-text#prompting)です。
    `gpt-4o-transcribe` 系モデルでは、`gpt-4o-transcribe-diarize` を除き、prompt は自由形式のテキスト文字列です。たとえば `"expect words related to technology"` のように指定できます。
    GA版 Realtime セッションでは、`gpt-realtime-whisper` は prompt をサポートしていません。
