import type { Metadata } from "next";
import { PageIntro } from "@/components/page-intro";
export const metadata: Metadata = {
  title: "Terms of service",
  alternates: { canonical: "/terms" },
};
export default function Terms() {
  return (
    <main id="main-content" className="page-shell legal">
      <PageIntro
        label="LAST UPDATED · OCTOBER 8, 2026"
        title="Terms of service"
        description="The ground rules for using this early edition of GritTruth."
      />
      <div className="editorial-body">
        <h2>The service</h2>
        <p>
          GritTruth provides an early-stage creative workspace for brand
          profiles, written drafts, and campaigns. Features may change or be
          unavailable. Demo mode uses sample templates; live AI requires
          configured third-party services. No subscription payment is collected
          in this edition.
        </p>
        <h2>Your account and use</h2>
        <p>
          Use the product only if you can enter a binding agreement and are an
          adult in your jurisdiction. Keep access to your email account secure.
          Do not abuse the service, attempt to access someone else’s data,
          bypass usage limits, or submit unlawful content. Service access may be
          restricted to address abuse or operational issues.
        </p>
        <h2>Your content</h2>
        <p>
          You retain the rights you have in content you provide. You authorize
          processing by GritTruth and configured providers as needed to store
          your content and fulfill your requests. You are responsible for having
          the necessary rights and permissions to submit material.
        </p>
        <h2>AI drafts need your judgment</h2>
        <p>
          AI output may be inaccurate, incomplete, similar to other output, or
          unsuitable for publication. Verify facts, product claims, legal
          compliance, and third-party rights before use. GritTruth does not
          guarantee originality, ownership eligibility, sales results, or
          platform approval. Written video concepts are not generated video
          files.
        </p>
        <h2>Availability and limits</h2>
        <p>
          The service is offered as an early-development product without an
          uptime commitment. Generation limits and provider availability may
          affect use. Export important work and keep your own copies. To the
          extent permitted by applicable law, the service is provided as
          available without warranties, and liability is limited to the extent
          the law permits. Nothing excludes rights or liability that cannot
          legally be excluded.
        </p>
        <h2>Leaving and getting help</h2>
        <p>
          You can delete drafts and campaigns and request account deletion at{" "}
          <a href="mailto:contact@grittruth.com">contact@grittruth.com</a>.
          Deleting a campaign also deletes its drafts. We may update these terms
          as the product evolves; the date above identifies the current edition.
        </p>
        <h2>Operator information</h2>
        <p>
          GritTruth is the product brand. A legal operating entity has not yet
          been publicly verified for this early edition. Business and service
          inquiries should be sent to contact@grittruth.com.
        </p>
      </div>
    </main>
  );
}
