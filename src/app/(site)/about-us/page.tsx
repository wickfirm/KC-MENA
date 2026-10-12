import type { Metadata } from "next";
import ClientPageCss from "@/components/site/ClientPageCss";
import AboutPageView from "@/components/site/AboutPageView";
import JsonLd from "@/components/site/JsonLd";
import { DEFAULT_ABOUT_CONTENT, isAboutContent } from "@/lib/about-content";
import { getPageBySlug } from "@/lib/pages";
import { fixedPageJsonLd, pageMetadata, resolvePageSeo } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageBySlug("about-us");
  return pageMetadata(resolvePageSeo("about-us", page?.seo));
}

export default async function AboutPage() {
  const page = await getPageBySlug("about-us");
  return (
    <><ClientPageCss page="about-us" />
      <AboutPageView content={isAboutContent(page?.content) ? page.content : DEFAULT_ABOUT_CONTENT} />
      <JsonLd data={fixedPageJsonLd("about-us", resolvePageSeo("about-us", page?.seo), "AboutPage")} />
    </>
  );
}
