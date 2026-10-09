import type { MetadataRoute } from "next";
export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://grittruth.com";
  return [
    "",
    "/product",
    "/how-it-works",
    "/about",
    "/contact",
    "/privacy",
    "/terms",
  ].map((p) => ({ url: base + p }));
}
