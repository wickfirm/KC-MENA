import type { Metadata } from "next";
import JsonLd from "@/components/site/JsonLd";
import { fixedPageJsonLd, pageMetadata, resolvePageSeo } from "@/lib/seo";
import { getPageBySlug } from "@/lib/pages";
import { notFound } from "next/navigation";
import { isBusinessDetailContent } from "@/lib/business-detail-content";
import { getPublishedProjectsBySector } from "@/lib/projects";
import BusinessDetailPageView from "@/components/site/BusinessDetailPageView";

export const dynamic = "force-dynamic";
export async function generateMetadata(): Promise<Metadata> { const page = await getPageBySlug("real-estate-development"); return pageMetadata(resolvePageSeo("real-estate-development", page?.seo)); }

export default async function Page() {
  const [page, projects] = await Promise.all([getPageBySlug("real-estate-development"), getPublishedProjectsBySector("real-estate-development")]);
  return (
    <>
      {isBusinessDetailContent(page?.content) ? <BusinessDetailPageView page="real-estate-development" content={page.content} projects={projects} referenceOverviewWidth /> : notFound()}
      <JsonLd data={fixedPageJsonLd("real-estate-development", resolvePageSeo("real-estate-development", page?.seo))} />
    </>
  );
}
