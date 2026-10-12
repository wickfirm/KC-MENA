import type { Metadata } from "next";
import SiteChrome from "@/components/site/SiteChrome";
import SiteFooter from "@/components/site/SiteFooter";
import JsonLd from "@/components/site/JsonLd";
import { PAGE_SEO, SITE_NAME, organizationJsonLd, websiteJsonLd } from "@/lib/seo";
import { getSiteSettings } from "@/lib/settings";
import { SITE_URL } from "@/lib/site";
import "./styles/tokens.css";
import "./styles/base.css";
// This is the delivered client stylesheet, retained as the final visual
// parity layer over the CMS-safe shared styles above.
import "./styles/reference-parity.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SITE_NAME, template: `%s | ${SITE_NAME}` },
  description: PAGE_SEO.home.description,
};

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings();
  return (
    <SiteChrome settings={settings} footer={<SiteFooter settings={settings} />}>
      {children}
      <JsonLd data={[organizationJsonLd(settings), websiteJsonLd()]} />
    </SiteChrome>
  );
}
