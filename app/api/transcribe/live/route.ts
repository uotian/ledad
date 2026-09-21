import { NextResponse } from "next/server";
import { exchangeSDP } from "@/ai/transcribe";
import { isSettings } from "@/lib/settings";

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  const payload: { sdp?: unknown; settings?: unknown } | null = await request.json().catch(() => null);
  let response: Response;

  if (!apiKey) {
    response = NextResponse.json({ error: "OPENAI_API_KEY is not set. Add it to .env.local." }, { status: 500 });
  } else if (typeof payload?.sdp !== "string" || !payload.sdp.trim()) {
    response = NextResponse.json({ error: "No SDP for Realtime connection." }, { status: 400 });
  } else if (!isSettings(payload.settings)) {
    response = NextResponse.json({ error: "Invalid transcription settings." }, { status: 400 });
  } else {
    try {
      const answer = await exchangeSDP(apiKey, payload.sdp, payload.settings);
      response = new Response(answer);
    } catch (error) {
      response = NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: 502 });
    }
  }
  return response;
}
