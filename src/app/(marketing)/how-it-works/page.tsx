import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro } from "@/components/page-intro";
export const metadata: Metadata = {
  title: "How it works",
  alternates: { canonical: "/how-it-works" },
};
export default function How() {
  return (
    <main id="main-content" className="page-shell">
      <PageIntro
        label="FROM INSTINCT TO INTENTION"
        title="Your voice. A little more structure."
        description="A simple creative process that keeps you in charge of the words."
      />
      <div className="steps">
        {[
          [
            "01",
            "Tell us what makes you, you.",
            "Build your Brand DNA. Describe your audience, choose a tone, add the words you love and the phrases you never want to use.",
          ],
          [
            "02",
            "Give your idea a direction.",
            "Choose a format and write a brief. In a connected account, Claude uses your saved brand context to create a first draft. In demo mode, you get an explicitly labeled sample template.",
          ],
          [
            "03",
            "Keep the parts that sound like you.",
            "Edit the draft yourself, adjust the tone, or regenerate. Check every factual claim. AI is a writing assistant; your judgment is the final step.",
          ],
          [
            "04",
            "Keep it together. Take it with you.",
            "Save drafts in a campaign. Export individual drafts as text or the campaign as a document. Publishing remains in your hands.",
          ],
        ].map(([n, title, body]) => (
          <article key={n}>
            <span className="step-number">{n}</span>
            <div>
              <h2>{title}</h2>
              <p>{body}</p>
            </div>
          </article>
        ))}
      </div>
      <div className="inline-cta">
        <p>A fictional brand is ready for you to experiment with.</p>
        <Link className="button" href="/workspace?demo=1">
          Try the process
        </Link>
      </div>
    </main>
  );
}
