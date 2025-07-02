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

    console.log("Transcribe API 呼び出し:", {
      audioFileSize: audioFile?.size,
      audioFileType: audioFile?.type,
      lang: lang,
      hasAudioFile: !!audioFile,
      hasLang: !!lang,
    });

    if (!audioFile) {
      console.error("音声ファイルがありません");
      return NextResponse.json({ error: "音声ファイルが必要です" }, { status: 400 });
    }
    if (!lang) {
      console.error("言語設定がありません");
      return NextResponse.json({ error: "言語設定が必要です" }, { status: 400 });
    }

    // ファイルサイズチェック
    if (audioFile.size > MAX_FILE_SIZE) {
      console.error(`ファイルサイズが大きすぎます: ${audioFile.size} bytes`);
      return NextResponse.json(
        {
          error: `ファイルサイズが大きすぎます。最大${MAX_FILE_SIZE / (1024 * 1024)}MBまで対応しています。`,
        },
        { status: 413 }
      );
    }

    console.log("OpenAI API 呼び出し開始");
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: "gpt-4o-transcribe",
      language: lang,
      response_format: "json",
    });

    console.log("OpenAI API 呼び出し成功");

    const text = transcription.text
      .replace(/([.!?])\s*([A-Z])/g, "$1\n$2")
      .replace(/([。！？])/g, "$1\n")
      .replace(/\n+/g, "\n")
      .trim();

    return NextResponse.json({ text });
  } catch (error) {
    console.error("音声認識エラー:", error);
    console.error("エラーの詳細:", {
      name: error instanceof Error ? error.name : "Unknown",
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });

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
