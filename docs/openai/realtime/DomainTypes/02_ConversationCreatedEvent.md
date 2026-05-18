# Conversation Created Event

- `ConversationCreatedEvent object { conversation, event_id, type }`

  conversation が作成されたときに返されます。session 作成の直後に送信されます。

  - `conversation: object { id, object }`

    conversation リソースです。

    - `id: optional string`

      conversation の一意なIDです。

    - `object: optional string`

      オブジェクト種別です。必ず `realtime.conversation` である必要があります。

  - `event_id: string`

    サーバーイベントの一意なIDです。

  - `type: "conversation.created"`

    イベント種別です。必ず `conversation.created` である必要があります。

    - `"conversation.created"`
