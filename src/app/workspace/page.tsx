import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { serverDb } from "@/lib/supabase/server";
import { Workspace } from "@/components/workspace";
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Your workspace",
  robots: { index: false, follow: false },
};
export default async function WorkspacePage({
  searchParams,
}: {
  searchParams: Promise<{ demo?: string }>;
}) {
  const { demo } = await searchParams;
  if (demo === "1") return <Workspace mode="demo" />;
  const db = await serverDb();
  if (!db) return <Workspace mode="demo" />;
  const {
    data: { user },
  } = await db.auth.getUser();
  if (!user) redirect("/login");
  return <Workspace mode="account" email={user.email} />;
}
