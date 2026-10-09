import { it, expect, vi, beforeEach } from "vitest";
import { sampleBrand } from "../src/lib/demo";
const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  create: vi.fn(),
  rpc: vi.fn(),
  brand: vi.fn(),
}));
vi.mock("@/lib/auth", () => ({ requireUser: mocks.auth }));
vi.mock("@anthropic-ai/sdk", () => {
  class APIError extends Error {
    status = 429;
  }
  class APIConnectionError extends Error {}
  class Anthropic {
    messages = { create: mocks.create };
    static APIError = APIError;
    static APIConnectionError = APIConnectionError;
  }
  return { default: Anthropic };
});
import Anthropic from "@anthropic-ai/sdk";
import { POST } from "../src/app/api/generate/route";
function request(
  body: unknown = {
    type: "Ad copy",
    brief: "An honest launch for a canvas tote",
    tone: "Brand voice",
  },
) {
  return new Request("http://localhost:3000/api/generate", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      origin: "http://localhost:3000",
    },
    body: JSON.stringify(body),
  });
}
beforeEach(() => {
  vi.resetAllMocks();
  vi.stubEnv("ANTHROPIC_API_KEY", "test-only-not-a-secret");
  mocks.auth.mockResolvedValue({
    user: { id: "owner" },
    db: {
      from: () => ({
        select: () => ({ eq: () => ({ maybeSingle: mocks.brand }) }),
      }),
      rpc: mocks.rpc,
    },
  });
  mocks.brand.mockResolvedValue({ data: sampleBrand, error: null });
  mocks.rpc.mockResolvedValue({ data: true, error: null });
  mocks.create.mockResolvedValue({
    content: [{ type: "text", text: "A considered draft." }],
    stop_reason: "end_turn",
  });
});
it("does not generate when credentials are missing", async () => {
  vi.stubEnv("ANTHROPIC_API_KEY", "");
  expect((await POST(request())).status).toBe(503);
  expect(mocks.create).not.toHaveBeenCalled();
});
it("rejects bad inputs before spending provider tokens", async () => {
  expect(
    (
      await POST(
        request({ type: "Ad copy", brief: "short", tone: "Brand voice" }),
      )
    ).status,
  ).toBe(400);
  expect(mocks.create).not.toHaveBeenCalled();
});
it("enforces the per-user daily cap", async () => {
  mocks.rpc.mockResolvedValue({ data: false, error: null });
  expect((await POST(request())).status).toBe(429);
  expect(mocks.create).not.toHaveBeenCalled();
});
it("fails closed if quota storage is unavailable", async () => {
  mocks.rpc.mockResolvedValue({ data: null, error: new Error() });
  expect((await POST(request())).status).toBe(503);
  expect(mocks.create).not.toHaveBeenCalled();
});
it("requires saved brand context", async () => {
  mocks.brand.mockResolvedValue({ data: null, error: null });
  expect((await POST(request())).status).toBe(400);
});
it("returns actual provider text and labels its source", async () => {
  const response = await POST(request());
  expect(response.status).toBe(200);
  expect(await response.json()).toMatchObject({
    content: "A considered draft.",
    source: "claude",
  });
  expect(mocks.create.mock.calls[0][0].messages[0].content).toContain(
    "Fieldwork",
  );
});
it("handles empty provider output", async () => {
  mocks.create.mockResolvedValue({ content: [], stop_reason: "end_turn" });
  expect((await POST(request())).status).toBe(502);
});
it("handles provider failure without exposing its raw error", async () => {
  const error = new Error("secret provider details");
  Object.setPrototypeOf(error, Anthropic.APIError.prototype);
  Object.assign(error, { status: 429 });
  mocks.create.mockRejectedValue(error);
  const r = await POST(request());
  expect(r.status).toBe(429);
  expect(JSON.stringify(await r.json())).not.toContain("secret");
});
it("rejects requests from another origin before authentication", async () => {
  const r = await POST(
    new Request("http://localhost/api/generate", {
      method: "POST",
      headers: { origin: "https://evil.test" },
    }),
  );
  expect(r.status).toBe(403);
  expect(mocks.auth).not.toHaveBeenCalled();
});
