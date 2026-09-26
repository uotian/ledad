import "server-only";
import { setTimeout as wait } from "node:timers/promises";

export class GeminiRateLimitError extends Error {
  constructor(public retryAfter?: number, message = "Gemini rate limit reached. Please check your API quota or try again later.") {
    super(message);
  }
}

type GenerateArgs = {
  instructions: string;
  input: string;
  schema?: object;
  signal?: AbortSignal;
};

export async function generate(apiKey: string, { instructions, input, schema, signal }: GenerateArgs) {
  const timeout = AbortSignal.timeout(60_000);
  const requestSignal = signal ? AbortSignal.any([signal, timeout]) : timeout;
  const deadline = Date.now() + 60_000;
  const options = {
    method: "POST",
    headers: { "x-goog-api-key": apiKey, "Content-Type": "application/json" },
    signal: requestSignal,
    body: JSON.stringify({
      model: "gemini-3.8-flash",
      system_instruction: instructions,
      input,
      response_format: schema ? { type: "text", mime_type: "application/json", schema } : undefined,
      generation_config: { thinking_level: "low", max_output_tokens: 8000 },
      store: false,
    }),
  };
  let response: Response;
  for (let attempt = 0; ; attempt++) {
    response = await fetch("https://generativelanguage.googleapis.com/v1beta/interactions", options);
    if (response.status !== 429 && response.status !== 503) break;
    const payload = await response.json().catch(() => null) as {
      error?: { message?: string; details?: { retryDelay?: string; violations?: { quotaId?: string; quotaValue?: string }[] }[] };
    } | null;
    const details = payload?.error?.details ?? [];
    const header = response.headers.get("Retry-After");
    const retryDelay = details.find((detail) => detail.retryDelay)?.retryDelay;
    const seconds = header ? (/^\d+(\.\d+)?$/.test(header) ? Number(header) : (Date.parse(header) - Date.now()) / 1000)
      : retryDelay ? Number.parseFloat(retryDelay) : NaN;
    const retryAfter = Number.isFinite(seconds) ? Math.max(0, Math.ceil(seconds)) : undefined;
    const violations = details.flatMap((detail) => detail.violations ?? []);
    const dailyLimit = violations.some((violation) => violation.quotaId?.includes("PerDay"))
      || /requests per day|daily (request )?(quota|limit)/i.test(payload?.error?.message ?? "");
    console.warn("[gemini:retry]", JSON.stringify({ status: response.status, attempt, retryAfter, dailyLimit, quotaIds: violations.map((violation) => violation.quotaId) }));
    if (response.status === 429 && dailyLimit) {
      throw new GeminiRateLimitError(undefined, "Gemini daily request limit reached. Enable billing in Google AI Studio or wait for your daily quota to reset.");
    }
    const exhausted = violations.some((violation) => violation.quotaValue === "0");
    const delay = Math.max((retryAfter ?? 0) * 1000, 2000 * 2 ** attempt);
    if (attempt >= 2 || exhausted || Date.now() + delay >= deadline) {
      if (response.status === 429) throw new GeminiRateLimitError(retryAfter);
      break;
    }
    await wait(delay, undefined, { signal: requestSignal });
  }
  if (!response.ok) throw new Error(`Gemini request failed (${response.status}).`);
  const result = await response.json() as {
    status?: string;
    steps?: { type?: string; content?: { type?: string; text?: string }[] }[];
  };
  if (result.status !== "completed") throw new Error("Gemini response was incomplete.");
  const text = result.steps?.filter((step) => step.type === "model_output")
    .flatMap((step) => step.content ?? []).filter((content) => content.type === "text")
    .map((content) => content.text ?? "").join("").trim();
  if (!text) throw new Error("Gemini did not return text.");
  return text;
}
