import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get("audio") as File;
    const lang = formData.get("lang") as string;

    if (!audioFile) {
      return NextResponse.json({ error: "音声ファイルが必要です" }, { status: 400 });
    }

    if (!lang) {
      return NextResponse.json({ error: "言語設定が必要です" }, { status: 400 });
    }

    // 音声ファイルをFormDataとして準備
    const whisperFormData = new FormData();
    whisperFormData.append("file", audioFile, "recording.webm");
    whisperFormData.append("model", "whisper-1");
    whisperFormData.append("language", lang);

    const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: whisperFormData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Whisper API error:", errorData);
      throw new Error(`Whisper API error: ${response.status}`);
    }

    const result = await response.json();

    // テキストをセンテンスごとに改行で区切る
    const text = result.text
      .replace(/([.!?。！？])\s*([A-Z])/g, "$1\n$2") // 句読点の後の英語大文字の前に改行を追加
      .replace(/\n+/g, "\n") // 連続する改行を1つに統一
      .trim(); // 前後の空白を削除

    return NextResponse.json({ text });
  } catch (error) {
    console.error("音声認識エラー:", error);
    return NextResponse.json({ error: "音声認識中にエラーが発生しました" }, { status: 500 });
  }
}
