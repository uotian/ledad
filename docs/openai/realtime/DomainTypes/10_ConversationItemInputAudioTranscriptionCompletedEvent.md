# Conversation Item Input Audio Transcription Completed Event

- `ConversationItemInputAudioTranscriptionCompletedEvent object { content_index, event_id, item_id, 4 more }`

  このイベントは、user audio buffer に書き込まれたユーザー音声に対する音声文字起こしの出力です。transcription は、input audio buffer がクライアントまたはサーバーによって commit されたときに開始されます（VAD が有効な場合はサーバーによって commit されます）。transcription は Response 作成とは非同期に実行されるため、このイベントは Response 系イベントの前に来ることも後に来ることもあります。

  Realtime API のモデルは音声をネイティブに受け付けるため、input transcription は別のASR（Automatic Speech Recognition、自動音声認識）モデルで実行される別プロセスです。transcript はモデル側の解釈と多少ずれる場合があるため、おおまかなガイドとして扱うべきです。

  - `content_index: number`

    音声を含む content part の index です。

  - `event_id: string`

    サーバーイベントの一意なIDです。

  - `item_id: string`

    transcription 対象の音声を含む item のIDです。

  - `transcript: string`

    文字起こしされたテキストです。

  - `type: "conversation.item.input_audio_transcription.completed"`

    イベント種別です。必ず `conversation.item.input_audio_transcription.completed` である必要があります。

    - `"conversation.item.input_audio_transcription.completed"`

  - `usage: object { input_tokens, output_tokens, total_tokens, 2 more }  or object { seconds, type }`

    transcription の使用量統計です。これは realtime model の料金ではなく、ASR model の料金に従って課金されます。

    - `TokenUsage object { input_tokens, output_tokens, total_tokens, 2 more }`

      token 使用量に基づいて課金されるモデル向けの使用量統計です。

      - `input_tokens: number`

        この request に対して課金された input token 数です。

      - `output_tokens: number`

        生成された output token 数です。

      - `total_tokens: number`

        使用された token の合計数です（input + output）。

      - `type: "tokens"`

        usage object の種類です。この variant では常に `tokens` です。

        - `"tokens"`

      - `input_token_details: optional object { audio_tokens, text_tokens }`

        この request に対して課金された input token の詳細です。

        - `audio_tokens: optional number`

          この request に対して課金された audio token 数です。

        - `text_tokens: optional number`

          この request に対して課金された text token 数です。

    - `DurationUsage object { seconds, type }`

      音声入力時間に基づいて課金されるモデル向けの使用量統計です。

      - `seconds: number`

        入力音声の長さです。単位は秒です。

      - `type: "duration"`

        usage object の種類です。この variant では常に `duration` です。

        - `"duration"`

  - `logprobs: optional array of LogProbProperties`

    transcription の log probabilities です。

    - `token: string`

      log probability の生成に使われた token です。

    - `bytes: array of number`

      log probability の生成に使われた bytes です。

    - `logprob: number`

      token の log probability です。
