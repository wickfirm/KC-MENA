import type { Metadata } from "next";
import Script from "next/script";
import SiteHeader from "@/components/site/SiteHeader";
import SiteFooter from "@/components/site/SiteFooter";
import ContactDrawer from "@/components/site/ContactDrawer";
import { getSiteSettings } from "@/lib/settings";
import "./styles/tokens.css";
import "./styles/base.css";

export const metadata: Metadata = {
  title: { default: "Kasumigaseki MENA", template: "%s — Kasumigaseki MENA" },
  description:
    "Kasumigaseki MENA is the regional subsidiary of Kasumigaseki Capital, headquartered in Tokyo, building across Development, Investment & Asset Management, and Food & Beverage.",
};

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings();
  return (
    <>
      <SiteHeader nav={settings.nav} />
      {children}
      <SiteFooter settings={settings} />
      <ContactDrawer settings={settings} />
      <Script src="/js/site.js" strategy="afterInteractive" />
    </>
  );
}
