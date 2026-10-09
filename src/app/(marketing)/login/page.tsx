import type { Metadata } from "next";
import { LoginForm } from "@/components/login-form";
import { databaseConfigured } from "@/lib/supabase/server";
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};
export default async function Login({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  return (
    <main id="main-content" className="login-shell">
      <section className="login-story">
        <span className="eyebrow">GOOD TO HAVE YOU HERE.</span>
        <h1>
          A little clarity.
          <br />A lot of <em>possibility.</em>
        </h1>
        <p>
          A space for your brand’s voice, your next idea, and the work that
          connects them.
        </p>
      </section>
      <section className="login-form-wrap">
        <LoginForm
          configured={databaseConfigured()}
          error={Boolean(params.error)}
        />
      </section>
    </main>
  );
}
