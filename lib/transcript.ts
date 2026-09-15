import type { Lang, Settings } from "@/lib/types";

export async function exchangeSDP({ langFrom, sdp, settings }: { langFrom: Lang; sdp: string; settings: Settings }) {
  const headers = {"Content-Type": "application/json", "X-Lang-From": langFrom};
  const response = await fetch("/api/transcript", {method: "POST", headers, body: JSON.stringify({ sdp, settings })});
  if (response.ok) return response.text();
  throw new Error((await response.json()).error);
}
