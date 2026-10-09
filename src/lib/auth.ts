import "server-only";
import { serverDb } from "./supabase/server";
import { HttpError } from "./http";
export async function requireUser() {
  const db = await serverDb();
  if (!db)
    throw new HttpError(
      503,
      "Accounts are not configured yet. You can explore the demo.",
    );
  const {
    data: { user },
    error,
  } = await db.auth.getUser();
  if (error || !user) throw new HttpError(401, "Sign in to continue.");
  return { db, user };
}
