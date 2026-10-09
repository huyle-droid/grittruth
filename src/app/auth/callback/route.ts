import { NextResponse } from "next/server";
import { serverDb } from "@/lib/supabase/server";
export async function GET(request: Request) {
  const url = new URL(request.url),
    db = await serverDb();
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  if (db) {
    const code = url.searchParams.get("code"),
      hash = url.searchParams.get("token_hash");
    const result = code
      ? await db.auth.exchangeCodeForSession(code)
      : hash
        ? await db.auth.verifyOtp({ token_hash: hash, type: "email" })
        : null;
    if (result && !result.error)
      return NextResponse.redirect(new URL("/workspace", base));
  }
  return NextResponse.redirect(new URL("/login?error=expired", base));
}
