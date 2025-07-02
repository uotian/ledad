import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get("audio") as File;
    const lang = formData.get("lang") as string;

    if (!audioFile) return NextResponse.json({ error: "音声ファイルが必要です" }, { status: 400 });
    if (!lang) return NextResponse.json({ error: "言語設定が必要です" }, { status: 400 });

    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: "gpt-4o-transcribe",
      language: lang,
      response_format: "json",
    });

    const text = transcription.text
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
