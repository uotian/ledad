import { NextRequest, NextResponse } from "next/server";
import { langMap } from "@/lib/storage";

export async function POST(request: NextRequest) {
  try {
    const { text, langFrom, langTo } = await request.json();
    if (!text || !langFrom || !langTo) {
      return NextResponse.json({ error: "テキスト、翻訳元言語、翻訳先言語が必要です" }, { status: 400 });
    }
    const fromLangName = langMap[langFrom] || langFrom;
    const toLangName = langMap[langTo] || langTo;

    const systemPrompt = [
      `あなたは${fromLangName}から${toLangName}への翻訳者です。`,
      `ネイティブではない人にも分かりやすい${toLangName}に翻訳してください。`,
      `文脈を考慮し、適切な表現を選択してください。`,
      `問題があった時のメッセージは${toLangName}ではなく${fromLangName}で返答してください。`,
      `また問題があったときは[ERROR]で始まるメッセージを返答してください。`,
      `また翻訳した文章は一行ごとに改行を加えてください`,
    ].join("\n");

    const headers = { "Content-Type": "application/json", Authorization: `Bearer ${process.env.OPENAI_API_KEY}` };
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers,
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

    if (!res.ok) {
      const errorText = await res.text();
      console.error("OpenAI API error:", errorText);
      throw new Error(`OpenAI API error: ${res.status}`);
    }

    const data = await res.json();
    const translated = data.choices[0].message.content
      .replace(/([.!?])\s*([A-Z])/g, "$1\n$2")
      .replace(/([。！？])/g, "$1\n$2")
      .replace(/\n+/g, "\n")
      .trim();
    return NextResponse.json({ translated });
  } catch (error) {
    console.error("翻訳エラー:", error);
    return NextResponse.json({ error: "翻訳中にエラーが発生しました" }, { status: 500 });
  }
}
