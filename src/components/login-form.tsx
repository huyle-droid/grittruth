"use client";
import { useState } from "react";
import Link from "next/link";
import { browserDb } from "@/lib/supabase/browser";
export function LoginForm({
  configured,
  error,
}: {
  configured: boolean;
  error: boolean;
}) {
  const [busy, setBusy] = useState(false),
    [message, setMessage] = useState(
      error
        ? "That sign-in link is invalid or expired. Request a new one."
        : "",
    ),
    [sent, setSent] = useState(false);
  return (
    <form
      className="login-form"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setMessage("");
        try {
          const email = String(new FormData(e.currentTarget).get("email"));
          const db = browserDb();
          if (!db) {
            setMessage(
              "Accounts are not connected yet. Explore the demo below.",
            );
            return;
          }
          const { error } = await db.auth.signInWithOtp({
            email,
            options: {
              emailRedirectTo:
                (process.env.NEXT_PUBLIC_SITE_URL || window.location.origin) +
                "/auth/callback",
            },
          });
          setSent(!error);
          setMessage(
            error
              ? "We couldn’t send a sign-in link. Please wait a moment and try again."
              : "Check your inbox for a sign-in link. It will work for both new and existing accounts.",
          );
        } catch {
          setMessage("Connection problem. Please try again.");
        } finally {
          setBusy(false);
        }
      }}
    >
      <span className="eyebrow">YOUR CREATIVE CORNER</span>
      <h2>Welcome to the studio.</h2>
      <p>Sign in with a secure email link. No password to remember.</p>
      <label>
        Email address
        <input
          name="email"
          required
          type="email"
          autoComplete="email"
          placeholder="you@yourbrand.com"
          maxLength={254}
          disabled={!configured || busy}
        />
      </label>
      <button className="button" disabled={!configured || busy}>
        {busy ? "Sending link…" : "Email me a sign-in link"}
      </button>
      {!configured && (
        <p className="feedback">
          Accounts are not connected in this installation yet. You can explore
          the complete demo without signing in.
        </p>
      )}
      {message && (
        <p className={sent ? "feedback success" : "feedback"} role="status">
          {message}
        </p>
      )}
      <p className="fine-print">
        By continuing, you agree to the{" "}
        <Link href="/terms">Terms of service</Link> and acknowledge the{" "}
        <Link href="/privacy">Privacy policy</Link>.
      </p>
      <Link className="button secondary" href="/workspace?demo=1">
        Explore the demo instead
      </Link>
    </form>
  );
}
