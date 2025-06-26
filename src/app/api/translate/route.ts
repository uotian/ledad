import { NextRequest, NextResponse } from "next/server";
import { langMap } from "@/app/local-storages";

export async function POST(request: NextRequest) {
  try {
    const { text, langFrom, langTo } = await request.json();

    if (!text || !langFrom || !langTo) {
      return NextResponse.json({ error: "テキスト、翻訳元言語、翻訳先言語が必要です" }, { status: 400 });
    }

    // 言語名を取得
    const fromLangName = langMap[langFrom] || langFrom;
    const toLangName = langMap[langTo] || langTo;

    const systemPrompt = `あなたは${fromLangName}から${toLangName}への翻訳者です。ネイティブではない人にも分かりやすい${toLangName}に翻訳してください。文脈を考慮し、適切な表現を選択してください。問題があった時のメッセージは${toLangName}ではなく${fromLangName}で返答してください。また問題があったときは[ERROR]で始まるメッセージを返答してください。また翻訳した文章は一行ごとに改行を加えてください`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: `以下のテキストを翻訳してください：\n\n${text}`,
          },
        ],
        max_tokens: 1000,
        temperature: 0.1, // より一貫性のある翻訳のため低めに設定
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const translatedText = data.choices[0].message.content.replace(/\n+/g, "\n");

    return NextResponse.json({
      translatedText,
      originalText: text,
      langFrom,
      langTo,
    });
  } catch (error) {
    console.error("翻訳エラー:", error);
    return NextResponse.json({ error: "翻訳中にエラーが発生しました" }, { status: 500 });
  }
}
