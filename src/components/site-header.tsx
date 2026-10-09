"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { BrandMark } from "./brand-mark";
export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const path = usePathname();
  return (
    <header className="site-header">
      <Link className="wordmark" href="/" aria-label="GritTruth home">
        <BrandMark />
        grittruth<span className="wordmark-period">.</span>
      </Link>
      <button
        className="menu-toggle icon-button"
        aria-label={open ? "Close navigation" : "Open navigation"}
        aria-expanded={open}
        aria-controls="site-nav"
        onClick={() => setOpen(!open)}
      >
        {open ? <X /> : <Menu />}
      </button>
      <nav
        id="site-nav"
        className={open ? "site-nav open" : "site-nav"}
        aria-label="Main navigation"
      >
        {[
          ["/product", "Product"],
          ["/how-it-works", "How it works"],
          ["/about", "Our story"],
        ].map(([href, label]) => (
          <Link
            key={href}
            href={href}
            aria-current={path === href ? "page" : undefined}
            onClick={() => setOpen(false)}
          >
            {label}
          </Link>
        ))}
        <span className="nav-spacer" />
        <Link href="/login" onClick={() => setOpen(false)}>
          Sign in
        </Link>
        <Link
          className="button small"
          href="/workspace?demo=1"
          onClick={() => setOpen(false)}
        >
          Explore the studio
        </Link>
      </nav>
    </header>
  );
}
