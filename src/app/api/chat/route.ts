import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { Message } from "@/lib/types";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { prompt, messages } = await request.json();
    if (!prompt) {
      return NextResponse.json({ error: "プロンプトが必要です" }, { status: 400 });
    }
    console.log("messages", messages);

    // 分析のベースとなるメッセージ情報を整理
    const contextMessages = messages
      ? messages.map((msg: Message) => ({
          role: "user" as const,
          content: `[${new Date(msg.timestamp * 1000).toISOString()}] User${msg.user}: ${msg.text}`,
        }))
      : [];

    const systemPrompt = [
      "あなたは親切で役立つAIアシスタントです。",
      "以下のメッセージ情報を分析のベースとして、ユーザーの質問に適切に回答してください。",
      "メッセージ情報には、発言者、発言内容、翻訳内容（ある場合）、発言時刻が含まれています。",
      "これらの情報を参考にして、文脈を理解し、適切な回答を提供してください。",
      "回答は簡潔で分かりやすく、実用的な内容にしてください。",
      "日本語で回答してください。",
    ].join("\n");

    console.log("systemPrompt", systemPrompt);
    console.log("contextMessages", contextMessages);
    console.log("prompt", prompt);
    const chatMessages = [
      {
        role: "system",
        content: systemPrompt,
      },
      ...contextMessages,
      {
        role: "user",
        content: `以下のメッセージ情報を参考にして、質問に回答してください：\n\n質問: ${prompt}`,
      },
    ];

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: chatMessages,
      max_tokens: 2000,
      temperature: 0.7,
    });

    const responseContent = completion.choices[0].message.content || "";
    console.log("Chat response:", responseContent);

    return NextResponse.json({
      response: responseContent,
      chatMessages: chatMessages,
      status: "success",
    });
  } catch (error) {
    console.error("チャットエラー:", error);
    return NextResponse.json({ error: "チャット中にエラーが発生しました" }, { status: 500 });
  }
}
