import Link from "next/link";
import { BrandMark } from "./brand-mark";
export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-top">
        <div>
          <Link className="wordmark" href="/">
            <BrandMark />
            grittruth.
          </Link>
          <p>Independent brands. Distinctive voices.</p>
        </div>
        <div className="footer-links">
          <Link href="/product">Product</Link>
          <Link href="/how-it-works">How it works</Link>
          <Link href="/about">About</Link>
          <Link href="/contact">Contact</Link>
        </div>
        <div className="footer-links">
          <a href="mailto:contact@grittruth.com">contact@grittruth.com</a>
          <Link href="/privacy">Privacy policy</Link>
          <Link href="/terms">Terms of service</Link>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} GritTruth</span>
        <span>An independent product, in early development.</span>
        <span>Made for a voice of your own.</span>
      </div>
    </footer>
  );
}
