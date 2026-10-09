import { createHmac } from "node:crypto";
import { contactSchema } from "@/lib/schema";
import { apiError, checkOrigin, readJson, json, HttpError } from "@/lib/http";
export async function POST(request: Request) {
  try {
    checkOrigin(request);
    const form = contactSchema.parse(await readJson(request));
    if (form.website)
      throw new HttpError(400, "Unable to submit this message.");
    const {
      RESEND_API_KEY,
      UPSTASH_REDIS_REST_URL,
      UPSTASH_REDIS_REST_TOKEN,
      RATE_LIMIT_SECRET,
    } = process.env;
    if (
      !RESEND_API_KEY ||
      !UPSTASH_REDIS_REST_URL ||
      !UPSTASH_REDIS_REST_TOKEN ||
      !RATE_LIMIT_SECRET
    )
      throw new HttpError(
        503,
        "The contact form is not connected yet. Please email contact@grittruth.com.",
      );
    // Use the sender's email, hashed at rest. Fixed-window counters expire automatically.
    const key = createHmac("sha256", RATE_LIMIT_SECRET)
      .update(form.email.toLowerCase())
      .digest("hex");
    const limit = await fetch(UPSTASH_REDIS_REST_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${UPSTASH_REDIS_REST_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify([
        "EVAL",
        "local n=redis.call('INCR',KEYS[1]); if n==1 then redis.call('EXPIRE',KEYS[1],3600) end; return n",
        1,
        "contact:" + key,
      ]),
      signal: AbortSignal.timeout(8000),
    });
    const counter = await limit.json();
    if (!limit.ok || typeof counter.result !== "number")
      throw new HttpError(
        503,
        "The form is temporarily unavailable. Please email contact@grittruth.com.",
      );
    if (counter.result > 3)
      throw new HttpError(
        429,
        "Please wait an hour before sending another message.",
      );
    // Global ceiling bounds abuse even when senders rotate email addresses.
    const globalLimit = await fetch(UPSTASH_REDIS_REST_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${UPSTASH_REDIS_REST_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify([
        "EVAL",
        "local n=redis.call('INCR',KEYS[1]); if n==1 then redis.call('EXPIRE',KEYS[1],3600) end; return n",
        1,
        "contact:global",
      ]),
      signal: AbortSignal.timeout(8000),
    });
    const globalCounter = await globalLimit.json();
    if (
      !globalLimit.ok ||
      typeof globalCounter.result !== "number" ||
      globalCounter.result > 30
    )
      throw new HttpError(
        503,
        "The form is temporarily unavailable. Please email contact@grittruth.com.",
      );
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.CONTACT_FROM || "GritTruth <website@grittruth.com>",
        to: ["contact@grittruth.com"],
        reply_to: form.email,
        subject: "GritTruth website inquiry",
        text: `Name: ${form.name}\nEmail: ${form.email}\n\n${form.message}`,
      }),
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok)
      throw new HttpError(
        502,
        "Your message was not accepted. Please try emailing contact@grittruth.com.",
      );
    return json({
      ok: true,
      message:
        "Your message has been accepted for delivery. Thank you for getting in touch.",
    });
  } catch (e) {
    return apiError(e);
  }
}
