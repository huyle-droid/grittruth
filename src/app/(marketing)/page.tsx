import type { Metadata } from "next";
import Link from "next/link";
import { AudioLines, Layers3, PenLine, Check, MoveUpRight } from "lucide-react";
import { StudioPreview } from "@/components/studio-preview";
export const metadata: Metadata = { alternates: { canonical: "/" } };
export default function Home() {
  return (
    <main id="main-content">
      <section className="home-hero">
        <div className="hero-copy">
          <div className="eyebrow">
            <span className="line-accent" /> THE INDEPENDENT BRAND’S CREATIVE
            WORKSPACE
          </div>
          <h1>
            Your Brand.
            <br />
            Your Voice.
            <br />
            <span className="serif">No Generic</span>
            <br />
            <span className="serif">AI Fluff.</span>
          </h1>
          <p className="hero-description">
            GritTruth is an AI-assisted creative workspace that helps
            independent brands develop a distinctive voice and turn ideas into
            consistent marketing content.
          </p>
          <div className="hero-actions">
            <Link className="button" href="/workspace?demo=1">
              Find your voice
            </Link>
            <Link className="text-link" href="/how-it-works">
              See how it works <MoveUpRight size={16} />
            </Link>
          </div>
          <p className="hero-note">
            Try the interactive demo. No account required.
          </p>
        </div>
        <div className="hero-visual">
          <div className="visual-caption">
            <span>LESS BLANK PAGE.</span>
            <span>MORE YOU.</span>
          </div>
          <StudioPreview />
          <div className="visual-footnote">
            <span className="asterisk">✳</span>
            <p>
              Your perspective is the starting point.
              <br />
              <strong>AI is the writing partner.</strong>
            </p>
            <span className="edition">
              THE STUDIO
              <br />
              EARLY EDITION / 01
            </span>
          </div>
        </div>
      </section>
      <div className="audience-strip">
        <span>BUILT FOR THE INDEPENDENTS</span>
        <p>E-commerce brands</p>
        <i />
        <p>POD sellers</p>
        <i />
        <p>Content creators</p>
        <i />
        <p>Small businesses</p>
      </div>
      <section className="section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">A LITTLE STRUCTURE. A LOT OF YOU.</span>
            <h2>
              Good content starts
              <br />
              with <em>a clear identity.</em>
            </h2>
          </div>
          <p>
            You bring the perspective. We give it a place to grow—from the first
            idea to the final edit.
          </p>
        </div>
        <div className="feature-grid">
          {[
            {
              icon: AudioLines,
              n: "01",
              title: "Define your DNA.",
              text: "Capture your audience, personality, vocabulary, and boundaries. Give every draft a shared starting point.",
              tag: "BRAND DNA",
            },
            {
              icon: PenLine,
              n: "02",
              title: "Create with intention.",
              text: "Move between captions, product stories, ad copy, and video concepts. Shape every line until it sounds like you.",
              tag: "CONTENT STUDIO",
            },
            {
              icon: Layers3,
              n: "03",
              title: "Keep the thread.",
              text: "Bring ideas and drafts together in campaigns. Save your progress, refine the details, and export when you’re ready.",
              tag: "CAMPAIGN WORKSPACE",
            },
          ].map((x) => (
            <article className="feature-card" key={x.n}>
              <div className="feature-card-top">
                <x.icon size={26} strokeWidth={1.4} />
                <span>{x.n}</span>
              </div>
              <h3>{x.title}</h3>
              <p>{x.text}</p>
              <span className="tiny">{x.tag}</span>
            </article>
          ))}
        </div>
      </section>
      <section className="manifesto">
        <span className="eyebrow">YOUR VOICE ISN’T A TEMPLATE.</span>
        <h2>
          The world has enough content.
          <br />
          Give it something <em>with character.</em>
        </h2>
        <p>
          We’re building GritTruth for the people behind the brand. The ones who
          care what they say, how they say it, and why it matters.
        </p>
        <Link className="text-link" href="/about">
          A little more about us <MoveUpRight size={16} />
        </Link>
      </section>
      <section className="section readiness">
        <div>
          <span className="eyebrow">SMALL START. HONEST AMBITION.</span>
          <h2>
            Built in the open.
            <br />
            <em>Clear about what’s here.</em>
          </h2>
        </div>
        <div>
          <div className="readiness-row">
            <Check size={20} />
            <div>
              <strong>Try today</strong>
              <p>
                Brand profiles, editable sample drafts, campaigns, and exports
                in the interactive demo.
              </p>
            </div>
          </div>
          <div className="readiness-row">
            <PenLine size={20} />
            <div>
              <strong>A connected workspace</strong>
              <p>
                Account storage and Claude generation require configured
                services. The studio always shows which mode you’re using.
              </p>
            </div>
          </div>
          <Link className="text-link" href="/product">
            Explore the product and roadmap
          </Link>
        </div>
      </section>
      <section className="closing-cta">
        <span className="eyebrow">LESS GENERIC. MORE GRITTRUTH.</span>
        <h2>
          Make it sound <em>like you.</em>
        </h2>
        <Link className="button light" href="/workspace?demo=1">
          Step inside the studio
        </Link>
        <span>No card. No invented magic. Just a place to start.</span>
      </section>
    </main>
  );
}
