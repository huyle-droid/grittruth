import "@fontsource/dm-sans/400.css";
import "@fontsource/dm-sans/500.css";
import "@fontsource/dm-sans/600.css";
import "@fontsource/dm-sans/700.css";
import "@fontsource/manrope/400.css";
import "@fontsource/manrope/600.css";
import "@fontsource/manrope/700.css";
import "@fontsource/manrope/800.css";
import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://grittruth.com",
  ),
  title: {
    default: "GritTruth — Your brand. Your voice.",
    template: "%s | GritTruth",
  },
  description:
    "An AI-assisted creative workspace for independent brands. Define your voice, develop ideas, and turn them into consistent marketing content.",
  icons: { icon: "/icon.svg" },
  openGraph: {
    siteName: "GritTruth",
    type: "website",
    locale: "en_US",
    title: "GritTruth — Your brand. Your voice.",
    description: "A creative workspace for independent brands.",
  },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
