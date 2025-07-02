import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ファイルサイズ制限（4MB）
const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4MB

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get("audio") as File;
    const lang = formData.get("lang") as string;

    if (!audioFile) return NextResponse.json({ error: "音声ファイルが必要です" }, { status: 400 });
    if (!lang) return NextResponse.json({ error: "言語設定が必要です" }, { status: 400 });

    // ファイルサイズチェック
    if (audioFile.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          error: `ファイルサイズが大きすぎます。最大${MAX_FILE_SIZE / (1024 * 1024)}MBまで対応しています。`,
        },
        { status: 413 }
      );
    }

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

    // OpenAI APIのエラーハンドリング
    if (error instanceof Error) {
      if (error.message.includes("413")) {
        return NextResponse.json({ error: "音声ファイルが大きすぎます。短い音声でお試しください。" }, { status: 413 });
      }
      if (error.message.includes("400")) {
        return NextResponse.json({ error: "音声ファイルの形式が正しくありません。" }, { status: 400 });
      }
    }

    return NextResponse.json({ error: "音声認識中にエラーが発生しました" }, { status: 500 });
  }
}
