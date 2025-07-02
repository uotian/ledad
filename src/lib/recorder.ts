export class Recorder {
  private chunks: Blob[] = [];
  private recorder: MediaRecorder | null = null;
  private id: string;

  constructor(id: string) {
    this.id = id;
  }

  async start(): Promise<void> {
    try {
      this.chunks = [];
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.recorder = new MediaRecorder(stream, { mimeType: "audio/webm;codecs=opus" });
      this.recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          this.chunks.push(e.data);
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
