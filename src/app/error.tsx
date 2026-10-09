"use client";
import Link from "next/link";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main id="main-content" className="error-page">
      <h1>We hit a snag.</h1>
      <p>Your saved work has not been changed. Please try again.</p>
      <button className="button" onClick={reset}>
        Try again
      </button>
      <Link href="/">Back home</Link>
    </main>
  );
}
