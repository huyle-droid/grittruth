import type { Metadata } from "next";
import { PageIntro } from "@/components/page-intro";
export const metadata: Metadata = {
  title: "Privacy policy",
  alternates: { canonical: "/privacy" },
};
export default function Privacy() {
  return (
    <main id="main-content" className="page-shell legal">
      <PageIntro
        label="LAST UPDATED · OCTOBER 8, 2026"
        title="Privacy policy"
        description="How information moves through this early edition of GritTruth."
      />
      <div className="editorial-body">
        <h2>Who to contact</h2>
        <p>
          GritTruth is the product brand. For privacy questions or requests,
          email <a href="mailto:contact@grittruth.com">contact@grittruth.com</a>
          . A legal operating entity has not yet been publicly verified for this
          early edition.
        </p>
        <h2>Demo information</h2>
        <p>
          The interactive demo stores your brand profile, campaigns, and drafts
          in local storage in your browser. Demo edits are not uploaded to our
          application database or sent to Claude. Clearing the demo removes
          those local records. Anyone using the same browser profile may be able
          to see them. Visiting the website still sends ordinary request
          information to our hosting provider.
        </p>
        <h2>Account and workspace information</h2>
        <p>
          When account services are connected, Supabase processes your email,
          authentication information, Brand DNA, campaigns, and saved drafts.
          Session cookies keep you signed in. Records are associated with your
          account and access is restricted through database policies. We do not
          require payment information in this edition.
        </p>
        <h2>AI processing</h2>
        <p>
          When you actively generate or revise content in a connected account,
          your saved Brand DNA, brief, format, tone, and any draft submitted for
          revision are sent to Anthropic to obtain a response. Do not submit
          secrets or sensitive personal data. Provider processing and retention
          are governed by its applicable terms and your service configuration;
          we do not claim zero retention or private model training guarantees.
        </p>
        <h2>Contact messages and abuse prevention</h2>
        <p>
          The contact form, when configured, sends your name, email, and message
          through Resend to contact@grittruth.com. Upstash stores hashed sender
          identifiers and short-lived counters to limit submissions; counters
          expire after one hour. Generation attempts are counted per account and
          UTC day in the application database. Website hosting and service
          providers may also process network and diagnostic information.
        </p>
        <h2>Cookies, analytics, and sharing</h2>
        <p>
          This application uses essential authentication cookies and local demo
          storage. No advertising trackers or analytics scripts are included in
          this source edition. If deployed on Vercel, Vercel processes hosting
          requests. Information is shared with configured infrastructure
          providers to deliver the requested functions, not sold through this
          application.
        </p>
        <h2>Retention and your choices</h2>
        <p>
          Account content remains until you delete it or request account
          deletion. You can edit and export your content, delete drafts and
          campaigns, and clear local demo data. Campaign deletion also deletes
          its drafts. To request account deletion or help accessing your
          information, email us. Database backups, provider logs, and email
          correspondence may remain subject to provider retention settings and
          applicable obligations.
        </p>
        <h2>Availability and changes</h2>
        <p>
          Data may be processed in regions used by configured providers. The
          product is intended for adult business users. We may update this
          policy as the product changes and will update the date above.
          Applicable privacy rights depend on your location; contact us to
          exercise them.
        </p>
      </div>
    </main>
  );
}
