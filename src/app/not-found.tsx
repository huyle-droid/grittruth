import Link from "next/link";
export default function NotFound() {
  return (
    <main id="main-content" className="error-page">
      <span className="eyebrow">404 / A SMALL DETOUR</span>
      <h1>This page isn’t here.</h1>
      <p>Let’s get you back to a better starting point.</p>
      <Link className="button" href="/">
        Back to GritTruth
      </Link>
    </main>
  );
}
