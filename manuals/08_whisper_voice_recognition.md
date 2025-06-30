# 08. 音声認識機能の実装

## 概要

アプリケーションに音声認識機能を追加しました。OpenAI Whisper API を使用した高精度な音声認識と、認識結果のテキストフォーマット機能を実装しています。

## 主な変更点

### 1. 音声認識 API の実装 (`src/app/api/whisper/`)

#### 1.1 Whisper API エンドポイント

##### 新規ファイル

- **`route.ts`**: Whisper API エンドポイント

  - OpenAI Whisper API を使用した音声認識
  - 多言語対応（言語指定による認識精度向上）
  - 音声ファイルの適切な処理
  - エラーハンドリングとレスポンス管理

##### 実装内容

```typescript
// 音声ファイルをFormDataとして準備
const whisperFormData = new FormData();
whisperFormData.append("file", audioFile, "recording.webm");
whisperFormData.append("model", "whisper-1");
whisperFormData.append("language", lang);

// OpenAI Whisper API を呼び出し
const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
  },
  body: whisperFormData,
});
```

#### 1.2 テキストフォーマット機能

##### センテンス区切り機能

音声認識結果を読みやすくするため、以下のフォーマット処理を実装：

```typescript
// テキストをセンテンスごとに改行で区切る
const text = result.text
  .replace(/([.!?。！？])\s*([A-Z])/g, "$1\n$2") // 句読点の後の英語大文字の前に改行を追加
  .replace(/\n+/g, "\n") // 連続する改行を1つに統一
  .trim(); // 前後の空白を削除
```

#### フォーマット例

**入力**: `Hello world. This is a test. こんにちは。Today is sunny.`

**出力**:

```
Hello world.
This is a test.
こんにちは。
Today is sunny.
```

### 2. フッターコンポーネントの分離

#### 変更内容

- **`src/containers/footer/mic-input.tsx`** → **input.tsx からリネーム**
- **`src/containers/footer/text-input.tsx`** → **新規作成**

#### 新規ファイル

- **`text-input.tsx`**: テキスト入力機能

  - input.tsx からリネーム

- **`mic-input.tsx`**: 音声入力機能
  - 音声録音機能
  - Whisper API との連携
  - 翻訳機能との連携
  - 録音状態の視覚的フィードバック
  - エラーハンドリング

### 3. フッターレイアウトの調整

#### 変更ファイル

- **`src/containers/footer/index.tsx`**: レイアウト調整
  - 音声入力とテキスト入力の配置
  - レスポンシブデザインの改善

### 4. データ管理の拡張

#### 変更ファイル

- **`src/app/local-storages.ts`**: 軽微な調整
- **`src/app/api/translate/access.ts`**: 軽微な調整

## 技術的特徴

### 1. 音声認識機能

- **OpenAI Whisper API**: 高精度な音声認識
- **多言語対応**: 言語指定による認識精度向上
- **ファイル形式対応**: WebM 形式の音声ファイル対応
- **エラーハンドリング**: 適切なエラーメッセージとステータス管理

### 2. テキストフォーマット

- **センテンス区切り**: 句読点と英語大文字による自動改行
- **改行統一**: 連続改行の正規化
- **空白処理**: 前後の余分な空白の削除

### 3. ユーザーエクスペリエンス

- **視覚的フィードバック**: 録音状態の表示
- **レスポンシブデザイン**: モバイル対応
- **アクセシビリティ**: スクリーンリーダー対応

## ファイル構造の変更

```
src/
├── app/
│   └── api/
│       └── whisper/ (新規ディレクトリ)
│           └── route.ts (新規)
├── containers/
│   └── footer/
│       ├── index.tsx (変更)
│       ├── mic-input.tsx (新規)
│       └── text-input.tsx (新規)
```

## 使用方法

### 1. 音声認識の利用

1. フッターのマイクアイコンをクリック
2. 音声を録音（録音中はアイコンが変化）
3. 録音停止後、自動的に音声認識が実行
4. 認識結果がテキスト入力欄に表示
5. 必要に応じて翻訳機能を使用

### 2. 環境設定

- **OPENAI_API_KEY**: OpenAI API キーの設定が必要
- **音声ファイル形式**: WebM 形式に対応
- **ブラウザ対応**: 音声録音機能をサポートするブラウザが必要

## 今後の拡張予定

1. **音声合成機能**: テキストを音声に変換
2. **リアルタイム音声認識**: ストリーミング音声認識
3. **音声品質向上**: ノイズ除去機能
4. **多言語音声認識**: 自動言語検出機能
5. **音声ファイル形式**: より多くの音声形式に対応

## 注意事項

- OpenAI API キーの環境変数設定が必要
- 音声録音にはブラウザの許可が必要
- 音声ファイルのサイズ制限に注意
- Whisper API の利用制限に注意
- プライバシーに配慮した音声処理

## トラブルシューティング

### よくある問題

1. **音声認識が動作しない**

   - OpenAI API キーの確認
   - ブラウザの音声録音許可の確認
   - ネットワーク接続の確認

2. **認識精度が低い**

   - 音声の品質確認
   - 言語設定の確認
   - 環境音の軽減

3. **ファイル形式エラー**
   - WebM 形式での録音確認
   - ブラウザの対応状況確認
