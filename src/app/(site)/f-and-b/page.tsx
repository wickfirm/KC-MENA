import type { Metadata } from "next";
import JsonLd from "@/components/site/JsonLd";
import { fixedPageJsonLd, pageMetadata, resolvePageSeo } from "@/lib/seo";
import { getPageBySlug } from "@/lib/pages";
import { notFound } from "next/navigation";
import { isBusinessDetailContent } from "@/lib/business-detail-content";
import { getPublishedProjectsBySector } from "@/lib/projects";
import BusinessDetailPageView from "@/components/site/BusinessDetailPageView";

export const dynamic = "force-dynamic";
export async function generateMetadata(): Promise<Metadata> { const page = await getPageBySlug("f-and-b"); return pageMetadata(resolvePageSeo("f-and-b", page?.seo)); }

export default async function Page() {
  const [page, projects] = await Promise.all([getPageBySlug("f-and-b"), getPublishedProjectsBySector("f-and-b")]);
  return (
    <>
      {isBusinessDetailContent(page?.content) ? <BusinessDetailPageView page="f-and-b" content={page.content} projects={projects} referenceOverviewWidth /> : notFound()}
      <JsonLd data={fixedPageJsonLd("f-and-b", resolvePageSeo("f-and-b", page?.seo))} />
    </>
  );
}
