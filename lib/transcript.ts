import type { Lang } from "@/lib/types";

export async function exchangeSDP({ langFrom, sdp }: { langFrom: Lang; sdp: string }) {
  const response = await fetch("/api/transcript", {
    method: "POST",
    headers: {
      "Content-Type": "application/sdp",
      "X-Lang-From": langFrom,
    },
    body: sdp,
  });
  if (response.ok) return response.text();
  const payload = await response.json();
  throw new Error(payload.error);
}
