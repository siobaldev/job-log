import env from "~~/lib/env";

export type AiProfile = "owner" | "demo";

type ChatCompletion = {
  model?: string;
  usage?: unknown;
  choices: {
    message: { content: string | null; reasoning?: string | null };
    finish_reason?: string;
  }[];
};

export async function completeJson(opts: { profile: AiProfile; system: string; user: string }) {
  const model = opts.profile === "owner" ? env.OPENROUTER_MODEL_OWNER : env.OPENROUTER_MODEL_DEMO;

  // One request to OpenRouter. This is the `call` from my sketch.
  async function call(): Promise<string> {
    const res = await $fetch<ChatCompletion>("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${env.OPENROUTER_API_KEY}` },
      // ofetch does not retry POST by default, so opt in for transient failures
      retry: 2,
      retryDelay: 1000,
      retryStatusCodes: [502, 503, 504],
      body: {
        model,
        messages: [{ role: "system", content: opts.system }, { role: "user", content: opts.user }],
        max_tokens: 100000,
        reasoning: { enabled: false }, // ignored by models that can't turn reasoning off
        ...(opts.profile === "owner" ? { response_format: { type: "json_object" } } : {}),
      },
    });

    const choice = res.choices[0];

    if (choice?.finish_reason === "length") {
      console.error("[ai] truncated, usage:", JSON.stringify(res.usage));
      return ""; // triggers the retry, then your "unexpected" 502
    }

    const text = choice?.message.content ?? "";

    return text;
  }

  let text = await call();
  if (!text.trim())
    text = await call(); // free models sometimes return nothing; try once more
  return text;
}
