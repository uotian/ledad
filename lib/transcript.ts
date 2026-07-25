import type { Lang } from "@/lib/types";

export async function exchangeSDP({ langFrom, sdp }: { langFrom: Lang; sdp: string }) {
  const headers = {"Content-Type": "application/sdp", "X-Lang-From": langFrom};
  const response = await fetch("/api/transcript", {method: "POST", headers, body: sdp});
  if (response.ok) return response.text();
  throw new Error((await response.json()).error);
}
