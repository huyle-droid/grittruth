import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro } from "@/components/page-intro";
import { StudioPreview } from "@/components/studio-preview";
export const metadata: Metadata = {
  title: "The product",
  alternates: { canonical: "/product" },
};
export default function Product() {
  return (
    <main id="main-content" className="page-shell">
      <PageIntro
        label="THE WORKSPACE"
        title="A home for your brand’s point of view."
        description="One place to define your voice, develop content, and keep your ideas connected."
      />
      <div className="product-overview">
        <StudioPreview />
        <div>
          <h2>Start with who you are.</h2>
          <p>
            Brand DNA captures your name, category, audience, personality, tone,
            preferred vocabulary, restricted phrases, and product context.
          </p>
          <h2>Then put it into words.</h2>
          <p>
            Create social captions, product descriptions, ad copy, short-form
            video concepts, and campaign ideas. Adjust tone, regenerate, edit,
            copy, or export.
          </p>
          <Link className="button" href="/workspace?demo=1">
            Try the workspace
          </Link>
        </div>
      </div>
      <section className="section compact">
        <h2>What works, and what’s next.</h2>
        <div className="status-grid">
          <article>
            <span className="pill">Interactive demo</span>
            <h3>Ready to explore</h3>
            <p>
              Save Brand DNA, organize campaigns, edit sample content, and
              download drafts. Demo data stays in this browser.
            </p>
          </article>
          <article>
            <span className="pill">Requires service setup</span>
            <h3>Connected account</h3>
            <p>
              Email sign-in and private database storage use Supabase. AI
              writing uses Claude when connected. The contact form uses an email
              delivery service.
            </p>
          </article>
          <article>
            <span className="pill neutral">Planned · no release date</span>
            <h3>Further down the road</h3>
            <p>
              Team collaboration, approval workflows, and publishing
              integrations are under consideration. They are not available in
              this edition.
            </p>
          </article>
        </div>
        <p className="fine-print">
          Video concepts are written storyboards, not generated videos. There is
          no billing or subscription checkout in this edition.
        </p>
      </section>
    </main>
  );
}
