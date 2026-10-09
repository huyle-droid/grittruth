import { it, expect, vi, beforeEach } from "vitest";
const mocks = vi.hoisted(() => ({ db: vi.fn() }));
vi.mock("@/lib/supabase/server", () => ({ serverDb: mocks.db }));
import { requireUser } from "../src/lib/auth";
beforeEach(() => vi.resetAllMocks());
it("fails closed when account services are absent", async () => {
  mocks.db.mockResolvedValue(null);
  await expect(requireUser()).rejects.toMatchObject({ status: 503 });
});
it("rejects an invalid or unverified session", async () => {
  mocks.db.mockResolvedValue({
    auth: {
      getUser: async () => ({
        data: { user: null },
        error: new Error("expired"),
      }),
    },
  });
  await expect(requireUser()).rejects.toMatchObject({ status: 401 });
});
it("uses the provider-verified identity", async () => {
  mocks.db.mockResolvedValue({
    auth: {
      getUser: async () => ({ data: { user: { id: "owner" } }, error: null }),
    },
  });
  expect((await requireUser()).user.id).toBe("owner");
});
