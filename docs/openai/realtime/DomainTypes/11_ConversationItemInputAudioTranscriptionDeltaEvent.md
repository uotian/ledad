# Conversation Item Input Audio Transcription Delta Event

- `ConversationItemInputAudioTranscriptionDeltaEvent object { event_id, item_id, type, 3 more }`

  input audio transcription content part のテキスト値が、増分の文字起こし結果で更新されたときに返されます。

  - `event_id: string`

    サーバーイベントの一意なIDです。

  - `item_id: string`

    transcription 対象の音声を含む item のIDです。

  - `type: "conversation.item.input_audio_transcription.delta"`

    イベント種別です。必ず `conversation.item.input_audio_transcription.delta` である必要があります。

    - `"conversation.item.input_audio_transcription.delta"`

  - `content_index: optional number`

    item の content 配列内における content part の index です。

  - `delta: optional string`

    テキストの差分です。

  - `logprobs: optional array of LogProbProperties`

    transcription の log probabilities です。session に `"include": ["item.input_audio_transcription.logprobs"]` を設定することで有効化できます。配列内の各要素は、この transcription chunk に対してどの token が選択されるかの log probability に対応します。これにより、ある transcription chunk について、複数の妥当な候補があり得たかどうかを把握しやすくなります。

    - `token: string`

      log probability の生成に使われた token です。

    - `bytes: array of number`

      log probability の生成に使われた bytes です。

    - `logprob: number`

      token の log probability です。
