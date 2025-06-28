import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get("audio") as File;
    const lang = formData.get("lang") as string;
    if (!audioFile) return NextResponse.json({ error: "音声ファイルが必要です" }, { status: 400 });
    if (!lang) return NextResponse.json({ error: "言語設定が必要です" }, { status: 400 });

    const body = new FormData();
    body.append("file", audioFile, "recording.webm");
    body.append("model", "whisper-1");
    body.append("language", lang);
    const headers = { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` };
    const res = await fetch("https://api.openai.com/v1/audio/transcriptions", { method: "POST", headers, body });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Whisper API error:", errorText);
      throw new Error(`Whisper API error: ${res.status}`);
    }

    const text = (await res.json()).text
      .replace(/([.!?])\s*([A-Z])/g, "$1\n$2")
      .replace(/([。！？])/g, "$1\n")
      .replace(/\n+/g, "\n")
      .trim();
    return NextResponse.json({ text });
  } catch (error) {
    console.error("音声認識エラー:", error);
    return NextResponse.json({ error: "音声認識中にエラーが発生しました" }, { status: 500 });
  }
}
