import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { langMap } from "@/lib/storage";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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
      `翻訳結果は必ず以下のJSON形式で返してください：`,
      `{"translated": ["翻訳されたテキスト(1センテンス毎に改行を加える)"], "status": "success", "message": "メッセージ"}`,
    ].join("\n");

    const completion = await openai.chat.completions.create({
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
      max_tokens: 10000,
      temperature: 0.1, // より一貫性のある翻訳のため低めに設定
      response_format: { type: "json_object" },
    });

    const responseContent = completion.choices[0].message.content || "{}";
    const result = JSON.parse(responseContent);
    console.log(result);

    return NextResponse.json({ translated: result.translated.join("\n") });
  } catch (error) {
    console.error("翻訳エラー:", error);
    return NextResponse.json({ error: "翻訳中にエラーが発生しました" }, { status: 500 });
  }
}
