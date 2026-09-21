import type { Settings } from "@/lib/types";

export async function requestSDP({ sdp, settings }: { sdp: string; settings: Settings }) {
  const headers = {"Content-Type": "application/json"};
  const response = await fetch("/api/transcribe/live", {method: "POST", headers, body: JSON.stringify({ sdp, settings })});
  if (response.ok) return response.text();
  throw new Error((await response.json()).error);
}
