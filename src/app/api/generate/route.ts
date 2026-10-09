import Anthropic from "@anthropic-ai/sdk";
import { requireUser } from "@/lib/auth";
import { apiError, checkOrigin, readJson, json, HttpError } from "@/lib/http";
import { brandSchema, generationSchema } from "@/lib/schema";
import { buildPrompt, systemPrompt } from "@/lib/prompt";
export const maxDuration = 60;
export async function POST(request: Request) {
  try {
    checkOrigin(request);
    const { db, user } = await requireUser();
    if (!process.env.ANTHROPIC_API_KEY)
      throw new HttpError(
        503,
        "AI generation is not connected. Sample mode is available in the studio.",
      );
    const input = generationSchema.parse(await readJson(request));
    const { data: brand, error } = await db
      .from("brands")
      .select(
        "name,category,audience,personality,tone,vocabulary,restricted,context",
      )
      .eq("user_id", user.id)
      .maybeSingle();
    if (error || !brand)
      throw new HttpError(
        400,
        "Save your Brand DNA before generating content.",
      );
    const validated = brandSchema.parse(brand);
    const { data: allowed, error: limitError } =
      await db.rpc("consume_generation");
    if (limitError)
      throw new HttpError(
        503,
        "Generation limits are temporarily unavailable.",
      );
    if (!allowed)
      throw new HttpError(
        429,
        "Your daily limit of 30 generation attempts is reached. Try again tomorrow (UTC).",
      );
    const client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
      timeout: 45000,
      maxRetries: 0,
    });
    const message = await client.messages.create({
      model: process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6",
      max_tokens: 1500,
      system: systemPrompt,
      messages: [{ role: "user", content: buildPrompt(validated, input) }],
    });
    const content = message.content
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("\n");
    if (!content.trim())
      throw new HttpError(
        502,
        "The provider returned no text. Try a different brief.",
      );
    return json({
      content,
      source: "claude",
      truncated: message.stop_reason === "max_tokens",
    });
  } catch (e) {
    if (e instanceof Anthropic.APIError)
      return json(
        {
          error:
            e.status === 429
              ? "The AI provider is busy. Please try again shortly."
              : "AI generation is temporarily unavailable. Your draft has not changed.",
        },
        e.status === 429 ? 429 : 502,
      );
    if (e instanceof Anthropic.APIConnectionError)
      return json(
        { error: "The AI provider could not be reached. Please try again." },
        502,
      );
    return apiError(e);
  }
}
