export class Recorder {
  private chunks: Blob[] = [];
  private recorder: MediaRecorder | null = null;
  private id: string;
  private maxSize: number = 3.5 * 1024 * 1024; // 3.5MB制限（4MB未満に設定）

  constructor(id: string) {
    this.id = id;
  }

  async start(): Promise<void> {
    try {
      this.chunks = [];
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 24000, // 24kHz固定
          channelCount: 1, // モノラル
          echoCancellation: true, // エコーキャンセレーション
          noiseSuppression: true, // ノイズ抑制
          autoGainControl: true, // 自動ゲイン制御
        },
      });

      console.log("録音開始: 24kHz, モノラル");
      this.recorder = new MediaRecorder(stream, { mimeType: "audio/webm;codecs=opus" });
      this.recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          this.chunks.push(e.data);

          // ファイルサイズをチェック
          const totalSize = this.chunks.reduce((sum, chunk) => sum + chunk.size, 0);
          if (totalSize > this.maxSize) {
            console.warn("録音ファイルが大きくなりすぎました。自動停止します。");
            this.stop();
          }
        }
      };
      this.recorder.start();
    } catch (err) {
      throw err;
    }
  }

  stop(): Promise<Blob> {
    return new Promise((resolve) => {
      if (!this.recorder) {
        resolve(new Blob());
      } else {
        this.recorder.onstop = () => {
          let audio: Blob = new Blob();
          if (this.chunks.length > 0) {
            audio = new Blob(this.chunks, { type: "audio/webm;codecs=opus" });

            // 最終的なファイルサイズチェック
            const sizeMB = (audio.size / (1024 * 1024)).toFixed(2);
            console.log(`録音完了: ${sizeMB}MB (24kHz, モノラル)`);

            if (audio.size > this.maxSize) {
              console.warn(`録音ファイルが大きすぎます: ${sizeMB}MB`);
            }
          }
          this.chunks = [];
          this.recorder = null;
          resolve(audio);
        };
        this.recorder.stop();
        this.recorder.stream.getTracks().forEach((track) => track.stop());
      }
    });
  }
}
