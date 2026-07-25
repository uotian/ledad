import { NextResponse } from "next/server";
import { exchangeSDP } from "@/ai/realtime/transcript";
import { readLang } from "@/lib/request";

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "OPENAI_API_KEY is not set. Add it to .env.local." }, { status: 500 });

  const langFrom = readLang(request, "X-Lang-From", "en");
  const offer = await request.text();
  if (!offer.trim()) return NextResponse.json({ error: "No SDP for Realtime connection." }, { status: 400 });

  try {
    const answer = await exchangeSDP(apiKey, offer, langFrom);
    return new Response(answer);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: 502 });
  }
}
