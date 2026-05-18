# Conversation Item

- `ConversationItem = RealtimeConversationItemSystemMessage or RealtimeConversationItemUserMessage or RealtimeConversationItemAssistantMessage or 6 more`

  Realtime conversation 内の単一の item です。

  - `RealtimeConversationItemSystemMessage object { content, role, type, 3 more }`

    Realtime conversation 内の system message は、モデルに追加の文脈や指示を与えるために使えます。これは会話開始時に与える instruction prompt と似ていますが、別のものです。system message は conversation の任意の時点で追加できるためです。conversation の振る舞いを大きく変える場合は instructions を使い、小さな更新、たとえば「ユーザーはいま別の話題について質問している」といった場合には system message を使います。

    - `content: array of object { text, type }`

      message の content です。

      - `text: optional string`

        テキスト内容です。

      - `type: optional "input_text"`

        content の種類です。system message では常に `input_text` です。

        - `"input_text"`

    - `role: "system"`

      message 送信者の role です。常に `system` です。

      - `"system"`

    - `type: "message"`

      item の種類です。常に `message` です。

      - `"message"`

    - `id: optional string`

      item の一意なIDです。クライアントが指定することも、サーバーが生成することもあります。

    - `object: optional "realtime.item"`

      返されるAPIオブジェクトの識別子です。常に `realtime.item` です。新しい item を作成する場合は任意です。

      - `"realtime.item"`

    - `status: optional "completed" or "incomplete" or "in_progress"`

      item の状態です。conversation には影響しません。

      - `"completed"`

      - `"incomplete"`

      - `"in_progress"`

  - `RealtimeConversationItemUserMessage object { content, role, type, 3 more }`

    Realtime conversation 内の user message item です。

    - `content: array of object { audio, detail, image_url, 3 more }`

      message の content です。

      - `audio: optional string`

        Base64エンコードされた音声バイト列です（`input_audio` 用）。これは session の input audio type 設定で指定された形式として解析されます。指定がない場合、デフォルトは PCM 16-bit 24kHz mono です。

      - `detail: optional "auto" or "low" or "high"`

        画像の詳細レベルです（`input_image` 用）。`auto` はデフォルトで `high` になります。

        - `"auto"`

        - `"low"`

        - `"high"`

      - `image_url: optional string`

        Base64エンコードされた画像バイト列です（`input_image` 用）。data URI として指定します。例: `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...`。対応形式は PNG と JPEG です。

      - `text: optional string`

        テキスト内容です（`input_text` 用）。

      - `transcript: optional string`

        音声の transcript です（`input_audio` 用）。これはモデルには送信されませんが、参照用として message item に添付されます。

      - `type: optional "input_text" or "input_audio" or "input_image"`

        content の種類です（`input_text`、`input_audio`、または `input_image`）。

        - `"input_text"`

        - `"input_audio"`

        - `"input_image"`

    - `role: "user"`

      message 送信者の role です。常に `user` です。

      - `"user"`

    - `type: "message"`

      item の種類です。常に `message` です。

      - `"message"`

    - `id: optional string`

      item の一意なIDです。クライアントが指定することも、サーバーが生成することもあります。

    - `object: optional "realtime.item"`

      返されるAPIオブジェクトの識別子です。常に `realtime.item` です。新しい item を作成する場合は任意です。

      - `"realtime.item"`

    - `status: optional "completed" or "incomplete" or "in_progress"`

      item の状態です。conversation には影響しません。

      - `"completed"`

      - `"incomplete"`

      - `"in_progress"`

  - `RealtimeConversationItemAssistantMessage object { content, role, type, 3 more }`

    Realtime conversation 内の assistant message item です。

    - `content: array of object { audio, text, transcript, type }`

      message の content です。

      - `audio: optional string`

        Base64エンコードされた音声バイト列です。これは session の output audio type 設定で指定された形式として解析されます。指定がない場合、デフォルトは PCM 16-bit 24kHz mono です。

      - `text: optional string`

        テキスト内容です。

      - `transcript: optional string`

        音声contentの transcript です。output type が `audio` の場合は常に存在します。

      - `type: optional "output_text" or "output_audio"`

        content の種類です。session の `output_modalities` 設定に応じて、`output_text` または `output_audio` になります。

        - `"output_text"`

        - `"output_audio"`

    - `role: "assistant"`

      message 送信者の role です。常に `assistant` です。

      - `"assistant"`

    - `type: "message"`

      item の種類です。常に `message` です。

      - `"message"`

    - `id: optional string`

      item の一意なIDです。クライアントが指定することも、サーバーが生成することもあります。

    - `object: optional "realtime.item"`

      返されるAPIオブジェクトの識別子です。常に `realtime.item` です。新しい item を作成する場合は任意です。

      - `"realtime.item"`

    - `status: optional "completed" or "incomplete" or "in_progress"`

      item の状態です。conversation には影響しません。

      - `"completed"`

      - `"incomplete"`

      - `"in_progress"`

  - `RealtimeConversationItemFunctionCall object { arguments, name, type, 4 more }`

    Realtime conversation 内の function call item です。

    - `arguments: string`

      function call の引数です。これは関数に渡された引数を表すJSONエンコード済み文字列です。例: `{"arg1": "value1", "arg2": 42}`。

    - `name: string`

      呼び出される関数の名前です。

    - `type: "function_call"`

      item の種類です。常に `function_call` です。

      - `"function_call"`

    - `id: optional string`

      item の一意なIDです。クライアントが指定することも、サーバーが生成することもあります。

    - `call_id: optional string`

      function call のIDです。

    - `object: optional "realtime.item"`

      返されるAPIオブジェクトの識別子です。常に `realtime.item` です。新しい item を作成する場合は任意です。

      - `"realtime.item"`

    - `status: optional "completed" or "incomplete" or "in_progress"`

      item の状態です。conversation には影響しません。

      - `"completed"`

      - `"incomplete"`

      - `"in_progress"`

  - `RealtimeConversationItemFunctionCallOutput object { call_id, output, type, 3 more }`

    Realtime conversation 内の function call output item です。

    - `call_id: string`

      この output が対応する function call のIDです。

    - `output: string`

      function call の出力です。これは自由形式のテキストで、任意の情報を含めることができ、単に空でも構いません。

    - `type: "function_call_output"`

      item の種類です。常に `function_call_output` です。

      - `"function_call_output"`

    - `id: optional string`

      item の一意なIDです。クライアントが指定することも、サーバーが生成することもあります。

    - `object: optional "realtime.item"`

      返されるAPIオブジェクトの識別子です。常に `realtime.item` です。新しい item を作成する場合は任意です。

      - `"realtime.item"`

    - `status: optional "completed" or "incomplete" or "in_progress"`

      item の状態です。conversation には影響しません。

      - `"completed"`

      - `"incomplete"`

      - `"in_progress"`

  - `RealtimeMcpApprovalResponse object { id, approval_request_id, approve, 2 more }`

    MCP approval request に応答する Realtime item です。

    - `id: string`

      approval response の一意なIDです。

    - `approval_request_id: string`

      応答対象の approval request のIDです。

    - `approve: boolean`

      request が承認されたかどうかです。

    - `type: "mcp_approval_response"`

      item の種類です。常に `mcp_approval_response` です。

      - `"mcp_approval_response"`

    - `reason: optional string`

      判断理由です。任意です。

  - `RealtimeMcpListTools object { server_label, tools, type, id }`

    MCP server 上で利用できる tools の一覧を表す Realtime item です。

    - `server_label: string`

      MCP server のラベルです。

    - `tools: array of object { input_schema, name, annotations, description }`

      server 上で利用できる tools です。

      - `input_schema: unknown`

        tool の入力を説明するJSON schemaです。

      - `name: string`

        tool の名前です。

      - `annotations: optional unknown`

        tool に関する追加の annotations です。

      - `description: optional string`

        tool の説明です。

    - `type: "mcp_list_tools"`

      item の種類です。常に `mcp_list_tools` です。

      - `"mcp_list_tools"`

    - `id: optional string`

      list の一意なIDです。

  - `RealtimeMcpToolCall object { id, arguments, name, 5 more }`

    MCP server 上の tool 呼び出しを表す Realtime item です。

    - `id: string`

      tool call の一意なIDです。

    - `arguments: string`

      tool に渡された引数のJSON文字列です。

    - `name: string`

      実行された tool の名前です。

    - `server_label: string`

      tool を実行している MCP server のラベルです。

    - `type: "mcp_call"`

      item の種類です。常に `mcp_call` です。

      - `"mcp_call"`

    - `approval_request_id: optional string`

      関連する approval request がある場合、そのIDです。

    - `error: optional RealtimeMcpProtocolError or RealtimeMcpToolExecutionError or RealtimeMcphttpError`

      tool call からのエラーです。存在する場合のみ含まれます。

      - `RealtimeMcpProtocolError object { code, message, type }`

        - `code: number`

        - `message: string`

        - `type: "protocol_error"`

          - `"protocol_error"`

      - `RealtimeMcpToolExecutionError object { message, type }`

        - `message: string`

        - `type: "tool_execution_error"`

          - `"tool_execution_error"`

      - `RealtimeMcphttpError object { code, message, type }`

        - `code: number`

        - `message: string`

        - `type: "http_error"`

          - `"http_error"`

    - `output: optional string`

      tool call からの出力です。

  - `RealtimeMcpApprovalRequest object { id, arguments, name, 2 more }`

    tool 呼び出しに対する人間の承認を要求する Realtime item です。

    - `id: string`

      approval request の一意なIDです。

    - `arguments: string`

      tool 用の引数のJSON文字列です。

    - `name: string`

      実行する tool の名前です。

    - `server_label: string`

      request を行っている MCP server のラベルです。

    - `type: "mcp_approval_request"`

      item の種類です。常に `mcp_approval_request` です。

      - `"mcp_approval_request"`
