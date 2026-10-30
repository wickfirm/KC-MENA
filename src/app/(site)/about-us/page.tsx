import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ClientPageCss from "@/components/site/ClientPageCss";
import AboutPageView from "@/components/site/AboutPageView";
import JsonLd from "@/components/site/JsonLd";
import { isAboutContent } from "@/lib/about-content";
import { getSiteSettings } from "@/lib/settings";
import { getPageBySlug } from "@/lib/pages";
import { fixedPageJsonLd, pageMetadata, resolvePageSeo } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageBySlug("about-us");
  return pageMetadata(resolvePageSeo("about-us", page?.seo));
}

export default async function AboutPage() {
  const [page, settings] = await Promise.all([getPageBySlug("about-us"), getSiteSettings()]);
  if (!isAboutContent(page?.content)) notFound();
  return (
    <><ClientPageCss page="about-us" />
      <AboutPageView content={page.content} siteType={settings.type} />
      <JsonLd data={fixedPageJsonLd("about-us", resolvePageSeo("about-us", page?.seo), "AboutPage")} />
    </>
  );
}
