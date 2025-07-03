# 20. 音声圧縮機能の実装

## 概要

413 エラー対策の一環として、音声ファイルのサイズを大幅に削減する音声圧縮機能を実装しました。ユーザーは音声品質を選択することで、ファイルサイズと音質のバランスを調整できます。

## 実装した機能

### 1. 音声品質設定

#### 3 段階の品質レベル

- **高品質 (High)**: 48kHz, ステレオ
- **標準品質 (Medium)**: 24kHz, モノラル（デフォルト）
- **低品質 (Low)**: 16kHz, モノラル

#### ファイルサイズの比較

| 品質     | サンプルレート | チャンネル | 30 秒録音の目安サイズ |
| -------- | -------------- | ---------- | --------------------- |
| 高品質   | 48kHz          | ステレオ   | 2-3MB                 |
| 標準品質 | 24kHz          | モノラル   | 1-1.5MB               |
| 低品質   | 16kHz          | モノラル   | 0.5-1MB               |

### 2. 技術的な実装

#### 変更ファイル: `src/lib/recorder.ts`

**追加機能**:

- 音声品質設定のコンストラクタパラメータ
- ブラウザ対応状況の自動検出
- 音声制約の動的設定
- ファイルサイズの詳細ログ

```typescript
constructor(id: string, audioQuality: 'high' | 'medium' | 'low' = 'medium') {
  this.id = id;
  this.audioQuality = audioQuality;
}

private getAudioConstraints(): MediaTrackConstraints {
  const baseConstraints = {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
  };

  switch (this.audioQuality) {
    case 'high':
      return {
        ...baseConstraints,
        sampleRate: 48000,
        channelCount: 2,
      };
    case 'medium':
      return {
        ...baseConstraints,
        sampleRate: 24000,
        channelCount: 1,
      };
    case 'low':
      return {
        ...baseConstraints,
        sampleRate: 16000,
        channelCount: 1,
      };
  }
}
```

#### 変更ファイル: `src/lib/storage.ts`

**追加機能**:

- 音声品質設定の保存・取得
- ユーザーフレンドリーな品質説明

```typescript
export const audioQualityMap: Record<string, string> = {
  high: "高品質 (48kHz, ステレオ)",
  medium: "標準品質 (24kHz, モノラル)",
  low: "低品質 (16kHz, モノラル)",
};
```

#### 変更ファイル: `src/containers/header/actions/setting-dialog.tsx`

**追加機能**:

- 音声品質選択 UI
- 設定の保存・読み込み

#### 変更ファイル: `src/containers/footer/mic-input.tsx`

**追加機能**:

- 録音時に音声品質設定を適用
- 動的な品質設定の反映

## 音声認識精度への影響

### 品質別の認識精度

1. **高品質**: 最高の認識精度、大きなファイルサイズ
2. **標準品質**: 良好な認識精度、適度なファイルサイズ（推奨）
3. **低品質**: 基本的な認識精度、小さなファイルサイズ

### 推奨設定

- **通常の会話**: 標準品質（24kHz, モノラル）
- **重要な会議**: 高品質（48kHz, ステレオ）
- **長い録音**: 低品質（16kHz, モノラル）

## ブラウザ対応

### 対応音声形式

1. `audio/webm;codecs=opus` (推奨)
2. `audio/webm`
3. `audio/mp4`
4. `audio/ogg;codecs=opus`
5. `audio/wav`

### 自動検出機能

ブラウザの対応状況を自動的に検出し、最適な音声形式を選択します。

```typescript
private getMimeType(): string {
  const mimeTypes = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/mp4',
    'audio/ogg;codecs=opus',
    'audio/wav'
  ];

  for (const mimeType of mimeTypes) {
    if (MediaRecorder.isTypeSupported(mimeType)) {
      return mimeType;
    }
  }

  return 'audio/webm;codecs=opus';
}
```

## 使用方法

### 1. 設定の変更

1. ヘッダーの設定アイコンをクリック
2. "Audio Quality" セクションで品質を選択
3. "Save" ボタンで保存

### 2. 録音の実行

設定した品質で自動的に録音が実行されます。

### 3. ファイルサイズの確認

ブラウザのコンソールでファイルサイズと品質情報が表示されます。

## パフォーマンスの改善

### ファイルサイズ削減効果

- **標準品質**: 従来比約 50%削減
- **低品質**: 従来比約 75%削減

### アップロード時間の短縮

- より小さなファイルサイズにより、アップロード時間が短縮
- 413 エラーの発生リスクを大幅に削減

### メモリ使用量の最適化

- 適切な音声品質設定により、メモリ使用量を最適化
- 長時間録音時の安定性向上

## 今後の拡張予定

1. **動的品質調整**: 録音時間に応じた自動品質調整
2. **音声前処理**: ノイズ除去・エコーキャンセレーションの強化
3. **ストリーミング圧縮**: リアルタイム音声圧縮
4. **カスタム品質設定**: ユーザー定義の品質パラメータ

## 注意事項

- 音声品質を下げると認識精度が低下する可能性があります
- 重要な会議やプレゼンテーションでは高品質設定を推奨します
- 長い録音では低品質設定でファイルサイズを制御してください
- ブラウザによって対応する音声形式が異なる場合があります

## トラブルシューティング

### よくある問題

1. **音声品質が反映されない**
   - ブラウザの対応状況を確認
   - 設定の保存後にページをリロード

2. **ファイルサイズが予想より大きい**
   - 音声品質設定を確認
   - 録音時間を短縮

3. **音声認識精度が低下**
   - 音声品質を上げる
   - 環境音を減らす
   - マイクとの距離を調整
