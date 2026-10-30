import type { Metadata } from "next";
import SiteChrome from "@/components/site/SiteChrome";
import SiteFooter from "@/components/site/SiteFooter";
import JsonLd from "@/components/site/JsonLd";
import { PAGE_SEO, SITE_NAME, organizationJsonLd, websiteJsonLd } from "@/lib/seo";
import { getSiteSettings } from "@/lib/settings";
import { SITE_URL } from "@/lib/site";
import "./styles/cms-type.css";

const CLIENT_FONTS_URL =
  "https://fonts.googleapis.com/css2?family=Noto+Serif:wght@400;500;600;700&family=Figtree:wght@300;400;500;600;700&display=swap";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SITE_NAME, template: `%s | ${SITE_NAME}` },
  description: PAGE_SEO.home.description,
};

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings();
  return (
    <SiteChrome settings={settings} footer={<SiteFooter settings={settings} />}>
      {/* Delivered webfonts, loaded exactly as the reference pages load them. Page CSS is
          rendered per page by <ClientPageCss>. */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link rel="stylesheet" href={CLIENT_FONTS_URL} precedence="default" />
      {children}
      <JsonLd data={[organizationJsonLd(settings), websiteJsonLd()]} />
    </SiteChrome>
  );
}
