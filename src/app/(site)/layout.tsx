import type { Metadata } from "next";
import SiteChrome from "@/components/site/SiteChrome";
import SiteFooter from "@/components/site/SiteFooter";
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
    <SiteChrome settings={settings} footer={<SiteFooter settings={settings} />}>
      {children}
    </SiteChrome>
  );
}
