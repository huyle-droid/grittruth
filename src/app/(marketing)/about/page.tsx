import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro } from "@/components/page-intro";
export const metadata: Metadata = {
  title: "Our story",
  alternates: { canonical: "/about" },
};
export default function About() {
  return (
    <main id="main-content" className="page-shell">
      <PageIntro
        label="THE IDEA BEHIND GRITTRUTH"
        title="Independent doesn’t have to mean doing it all alone."
        description="GritTruth is an early-stage product for independent brands that want useful creative support without losing their identity."
      />
      <div className="editorial-body">
        <h2>A point of view comes first.</h2>
        <p>
          There is no shortage of words on the internet. What is harder to find
          is a consistent voice: one that reflects the people, products, and
          ideas behind a business.
        </p>
        <p>
          GritTruth starts there. Capture what your brand stands for, use that
          context to guide a draft, and keep the human judgment that makes the
          work your own.
        </p>
        <h2>Practical tools. Honest expectations.</h2>
        <p>
          We’re building for e-commerce brands, print-on-demand sellers,
          creators, and small businesses. This first edition brings brand
          profiles, a writing studio, and a campaign workspace together.
        </p>
        <p>
          The demo is available to explore. Live accounts and AI depend on
          connected services, and the interface makes that distinction explicit.
          GritTruth uses third-party AI; we do not claim to have built a
          proprietary model.
        </p>
        <h2>Still early. Open to conversation.</h2>
        <p>
          The product is in early development. We have no public customer,
          funding, certification, or partnership claims to announce. Questions
          and thoughtful feedback are welcome.
        </p>
        <Link className="button" href="/contact">
          Get in touch
        </Link>
      </div>
    </main>
  );
}
