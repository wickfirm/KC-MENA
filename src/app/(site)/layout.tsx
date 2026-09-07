import type { Metadata } from "next";
import Script from "next/script";
import SiteHeader from "@/components/site/SiteHeader";
import SiteFooter from "@/components/site/SiteFooter";
import ContactDrawer from "@/components/site/ContactDrawer";
import "./site-base.css";

export const metadata: Metadata = {
  title: { default: "Kasumigaseki MENA", template: "%s — Kasumigaseki MENA" },
  description:
    "Kasumigaseki MENA is the regional subsidiary of Kasumigaseki Capital, headquartered in Tokyo, building across Development, Investment & Asset Management, and Food & Beverage.",
};

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Serif:wght@400;500;600;700&family=Figtree:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        {/* Shared styles from the delivered site (footer, cards, sections) */}
        <link rel="stylesheet" href="/css/site.css" />
      </head>
      <body>
        <SiteHeader />
        {children}
        <SiteFooter />
        <ContactDrawer />
        <Script src="/js/site.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
