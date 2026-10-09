import { it, expect, vi, beforeEach, afterEach } from "vitest";
import { POST } from "../src/app/api/contact/route";
const fetcher = vi.fn();
beforeEach(() => {
  vi.stubGlobal("fetch", fetcher);
  fetcher.mockReset();
  for (const k of [
    "RESEND_API_KEY",
    "UPSTASH_REDIS_REST_URL",
    "UPSTASH_REDIS_REST_TOKEN",
    "RATE_LIMIT_SECRET",
  ])
    vi.stubEnv(k, "");
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});
const input = {
  name: "Alex",
  email: "alex@example.com",
  message: "I have a question about brand profiles.",
};
function request(data: unknown = input) {
  return new Request("http://localhost:3000/api/contact", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      origin: "http://localhost:3000",
    },
    body: JSON.stringify(data),
  });
}
function configured() {
  for (const k of [
    "RESEND_API_KEY",
    "UPSTASH_REDIS_REST_URL",
    "UPSTASH_REDIS_REST_TOKEN",
    "RATE_LIMIT_SECRET",
  ])
    vi.stubEnv(k, "test-value");
}
it("never claims to send without configuration", async () => {
  expect((await POST(request())).status).toBe(503);
  expect(fetcher).not.toHaveBeenCalled();
});
it("validates before sending and rejects honeypots", async () => {
  expect((await POST(request({ ...input, email: "not-email" }))).status).toBe(
    400,
  );
  expect((await POST(request({ ...input, website: "spam" }))).status).toBe(400);
});
it("rejects over-limit senders", async () => {
  configured();
  fetcher.mockResolvedValueOnce(Response.json({ result: 4 }));
  expect((await POST(request())).status).toBe(429);
  expect(fetcher).toHaveBeenCalledTimes(1);
});
it("handles delivery errors honestly", async () => {
  configured();
  fetcher
    .mockResolvedValueOnce(Response.json({ result: 1 }))
    .mockResolvedValueOnce(Response.json({ result: 1 }))
    .mockResolvedValueOnce(new Response("unavailable", { status: 500 }));
  expect((await POST(request())).status).toBe(502);
});
it("reports accepted delivery only after the provider accepts", async () => {
  configured();
  fetcher
    .mockResolvedValueOnce(Response.json({ result: 1 }))
    .mockResolvedValueOnce(Response.json({ result: 1 }))
    .mockResolvedValueOnce(Response.json({ id: "mail-id" }));
  const r = await POST(request());
  expect(r.status).toBe(200);
  const mail = JSON.parse(fetcher.mock.calls[2][1].body);
  expect(mail.to).toEqual(["contact@grittruth.com"]);
  expect(mail.reply_to).toBe(input.email);
});
