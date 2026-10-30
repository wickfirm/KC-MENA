import type { Metadata } from "next";
import { notFound } from "next/navigation";
import JsonLd from "@/components/site/JsonLd";
import { fixedPageJsonLd, pageMetadata, resolvePageSeo } from "@/lib/seo";
import { getPageBySlug } from "@/lib/pages";
import { isBusinessDetailContent } from "@/lib/business-detail-content";
import { getPublishedProjectsBySector } from "@/lib/projects";
import BusinessDetailPageView from "@/components/site/BusinessDetailPageView";

export const dynamic = "force-dynamic";
export async function generateMetadata(): Promise<Metadata> { const page = await getPageBySlug("real-estate"); return pageMetadata(resolvePageSeo("real-estate", page?.seo)); }

export default async function Page() {
  const [page, projects] = await Promise.all([getPageBySlug("real-estate"), getPublishedProjectsBySector("real-estate")]);
  if (!isBusinessDetailContent(page?.content)) notFound();
  return (
    <>
      <BusinessDetailPageView page="real-estate" content={page.content} projects={projects} referenceOverviewWidth />
      <JsonLd data={fixedPageJsonLd("real-estate", resolvePageSeo("real-estate", page?.seo))} />
    </>
  );
}
