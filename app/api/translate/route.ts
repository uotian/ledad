import { NextResponse } from "next/server";
import { translate } from "@/ai/translate";
import { readLang } from "@/lib/request";

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "OPENAI_API_KEY が未設定です。.env.local にAPIキーを設定してください。" }, { status: 500 });

  const langFrom = readLang(request, "X-Lang-From", "en");
  const langTo = readLang(request, "X-Lang-To", "ja");
  const text = (await request.text()).trim();
  if (!text) return NextResponse.json({ error: "翻訳するテキストがありません。" }, { status: 400 });

  try {
    const translation = await translate(apiKey, langFrom, langTo, text);
    return NextResponse.json({ translation });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: 502 });
  }
}
