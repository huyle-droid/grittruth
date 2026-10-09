import type { MetadataRoute } from "next";
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/workspace", "/login", "/auth/", "/api/"],
    },
    sitemap:
      (process.env.NEXT_PUBLIC_SITE_URL || "https://grittruth.com") +
      "/sitemap.xml",
  };
}
