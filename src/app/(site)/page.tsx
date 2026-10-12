import type { Metadata } from "next";
import ClientPageCss from "@/components/site/ClientPageCss";
import HomePageView from "@/components/site/HomePageView";
import JsonLd from "@/components/site/JsonLd";
import { normalizeHomeContent } from "@/lib/home-content";
import { getPageBySlug } from "@/lib/pages";
import { fixedPageJsonLd, pageMetadata, resolvePageSeo } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageBySlug("home");
  return pageMetadata(resolvePageSeo("home", page?.seo));
}

export default async function HomePage() {
  const page = await getPageBySlug("home");
  const document = normalizeHomeContent(page?.content);
  return (
    <><ClientPageCss page="home" />
      <HomePageView document={document} />
      <JsonLd data={fixedPageJsonLd("home", resolvePageSeo("home", page?.seo))} />
    </>
  );
}
