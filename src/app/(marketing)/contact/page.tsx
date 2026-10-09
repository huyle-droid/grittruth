import type { Metadata } from "next";
import { PageIntro } from "@/components/page-intro";
import { ContactForm } from "@/components/contact-form";
export const metadata: Metadata = {
  title: "Contact",
  alternates: { canonical: "/contact" },
};
export default function Contact() {
  return (
    <main id="main-content" className="page-shell">
      <PageIntro
        label="LET’S TALK"
        title="A real conversation starts here."
        description="Questions about the workspace, an idea for the product, or something we can improve? We’d like to hear it."
      />
      <div className="contact-grid">
        <aside>
          <h2>Write to us.</h2>
          <a className="contact-email" href="mailto:contact@grittruth.com">
            contact@grittruth.com
          </a>
          <p>
            GritTruth is in early development. We read inquiries as we build; we
            do not promise a specific response time.
          </p>
          <div className="note-card">
            <span className="eyebrow">A QUICK NOTE</span>
            <p>
              Please don’t include passwords, payment information, or sensitive
              personal data.
            </p>
          </div>
        </aside>
        <ContactForm />
      </div>
    </main>
  );
}
