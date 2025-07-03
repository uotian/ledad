import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { text, voice = "alloy" } = await request.json();

    if (!text) {
      return NextResponse.json(
        { error: "テキストが必要です" },
        { status: 400 }
      );
    }

    const response = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "tts-1",
        input: text,
        voice: voice, // alloy, echo, fable, onyx, nova, shimmer
        response_format: "mp3",
        speed: 1.0,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI TTS API error: ${response.status}`);
    }

    const audioBuffer = await response.arrayBuffer();
    const audioBase64 = Buffer.from(audioBuffer).toString("base64");

    return NextResponse.json({
      audio: audioBase64,
      text: text,
      voice: voice,
      format: "mp3",
    });
  } catch (error) {
    console.error("発声エラー:", error);
    return NextResponse.json(
      { error: "発声中にエラーが発生しました" },
      { status: 500 }
    );
  }
}
