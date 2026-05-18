# Realtime Transcription Session Audio Input Turn Detection

- `RealtimeTranscriptionSessionAudioInputTurnDetection = object { type, create_response, idle_timeout_ms, 4 more }  or object { type, create_response, eagerness, interrupt_response }`

  turn detection の設定です。Server VAD または Semantic VAD を指定します。`null` に設定するとオフにでき、その場合クライアントが手動でモデル応答をトリガーする必要があります。

  Server VAD では、モデルが音声の音量に基づいて発話の開始と終了を検出し、ユーザー発話の終了時に応答します。

  Semantic VAD はより高度で、turn detection model を使い、VAD と組み合わせて、ユーザーが話し終えたかどうかを意味的に推定します。その確率に基づいて timeout を動的に設定します。たとえば、ユーザー音声が `"uhhm"` のように途切れかけている場合、モデルは turn end の確率を低く評価し、ユーザーが話し続けるのをより長く待ちます。これはより自然な会話に役立ちますが、レイテンシが高くなる場合があります。

  `gpt-realtime-whisper` の transcription session では、turn detection は `null` に設定する必要があります。VAD はサポートされていません。

  - `ServerVad object { type, create_response, idle_timeout_ms, 4 more }`

    サーバー側の voice activity detection（VAD）です。ユーザー発話が検出されるとオンになり、一定時間の無音後にオフになります。

    - `type: "server_vad"`

      turn detection の種類です。単純な Server VAD をオンにするには `server_vad` を指定します。

      - `"server_vad"`

    - `create_response: optional boolean`

      VAD stop event が発生したときに、自動で response を生成するかどうかです。`interrupt_response` が `false` に設定されている場合、モデルがすでに応答中だと response 作成に失敗することがあります。

      `create_response` と `interrupt_response` の両方が `false` の場合、モデルは自動では応答しませんが、VAD events は引き続き送信されます。

    - `idle_timeout_ms: optional number`

      指定した時間が経過した後、モデル応答を自動でトリガーする任意の timeout です。これは、電話のようにユーザーの長い沈黙が想定外である状況で役立ちます。モデルは現在の文脈に基づいて、ユーザーに会話の継続を促すように動作します。

      timeout 値は、直近のモデル応答の音声再生が終了した後に適用されます。つまり、`response.done` の時刻に音声再生時間を足した時点を基準に設定されます。

      timeout に達すると、`input_audio_buffer.timeout_triggered` イベントと、Response に関連するイベントが送信されます。Idle timeout は現在 `server_vad` mode でのみサポートされています。

    - `interrupt_response: optional boolean`

      VAD start event が発生したときに、default conversation（つまり `conversation` が `auto` のもの）へ出力中の進行中 response を自動で割り込み（キャンセル）するかどうかです。`true` の場合、response はキャンセルされます。そうでない場合、完了するまで続きます。

      `create_response` と `interrupt_response` の両方が `false` の場合、モデルは自動では応答しませんが、VAD events は引き続き送信されます。

    - `prefix_padding_ms: optional number`

      `server_vad` mode でのみ使われます。VAD が発話を検出する前の音声をどれくらい含めるかを表します（ミリ秒単位）。デフォルトは300msです。

    - `silence_duration_ms: optional number`

      `server_vad` mode でのみ使われます。発話終了を検出するための無音時間です（ミリ秒単位）。デフォルトは500msです。値を短くするとモデルはより速く応答しますが、ユーザーの短い間に割り込む可能性があります。

    - `threshold: optional number`

      `server_vad` mode でのみ使われます。VAD の起動しきい値です（0.0から1.0）。デフォルトは0.5です。しきい値を高くすると、モデルを起動するためにより大きな音声が必要になり、騒がしい環境ではうまく動作する可能性があります。

  - `SemanticVad object { type, create_response, eagerness, interrupt_response }`

    ユーザーが話し終えたかどうかをモデルで判定する、サーバー側の semantic turn detection です。

    - `type: "semantic_vad"`

      turn detection の種類です。Semantic VAD をオンにするには `semantic_vad` を指定します。

      - `"semantic_vad"`

    - `create_response: optional boolean`

      VAD stop event が発生したときに、自動で response を生成するかどうかです。

    - `eagerness: optional "low" or "medium" or "high" or "auto"`

      `semantic_vad` mode でのみ使われます。モデルが応答しようとする積極性です。`low` はユーザーが話し続けるのをより長く待ち、`high` はより速く応答します。`auto` はデフォルトで、`medium` と同等です。`low`、`medium`、`high` の最大timeoutはそれぞれ8秒、4秒、2秒です。

      - `"low"`

      - `"medium"`

      - `"high"`

      - `"auto"`

    - `interrupt_response: optional boolean`

      VAD start event が発生したときに、default conversation（つまり `conversation` が `auto` のもの）へ出力中の進行中 response を自動で割り込みするかどうかです。
