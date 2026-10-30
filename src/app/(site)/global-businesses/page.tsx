import type { Metadata } from "next";
import JsonLd from "@/components/site/JsonLd";
import { fixedPageJsonLd, pageMetadata, resolvePageSeo } from "@/lib/seo";
import { getPageBySlug } from "@/lib/pages";
import { notFound } from "next/navigation";
import { isBusinessDetailContent } from "@/lib/business-detail-content";
import { getPublishedProjectsBySector } from "@/lib/projects";
import BusinessDetailPageView from "@/components/site/BusinessDetailPageView";

export const dynamic = "force-dynamic";
export async function generateMetadata(): Promise<Metadata> { const page = await getPageBySlug("global-businesses"); return pageMetadata(resolvePageSeo("global-businesses", page?.seo)); }

export default async function Page() {
  const [page, projects] = await Promise.all([getPageBySlug("global-businesses"), getPublishedProjectsBySector("global-businesses")]);
  return (
    <>
      {isBusinessDetailContent(page?.content) ? <BusinessDetailPageView page="global-businesses" content={page.content} projects={projects} /> : notFound()}
      <JsonLd data={fixedPageJsonLd("global-businesses", resolvePageSeo("global-businesses", page?.seo))} />
    </>
  );
}
