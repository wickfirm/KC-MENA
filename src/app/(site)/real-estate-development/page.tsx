import type { Metadata } from "next";
import JsonLd from "@/components/site/JsonLd";
import { fixedPageJsonLd, pageMetadata, resolvePageSeo } from "@/lib/seo";
import { getPageBySlug } from "@/lib/pages";
import { DEFAULT_BUSINESS_DETAILS, isBusinessDetailContent, withBusinessDefaults } from "@/lib/business-detail-content";
import { getPublishedProjectsBySector } from "@/lib/projects";
import BusinessDetailPageView from "@/components/site/BusinessDetailPageView";

export const dynamic = "force-dynamic";
export async function generateMetadata(): Promise<Metadata> { const page = await getPageBySlug("real-estate-development"); return pageMetadata(resolvePageSeo("real-estate-development", page?.seo)); }

export default async function Page() {
  const [page, projects] = await Promise.all([getPageBySlug("real-estate-development"), getPublishedProjectsBySector("real-estate-development")]);
  return (
    <>
      <BusinessDetailPageView page="real-estate-development" content={withBusinessDefaults("real-estate-development", isBusinessDetailContent(page?.content) ? page.content : DEFAULT_BUSINESS_DETAILS["real-estate-development"])} projects={projects} referenceOverviewWidth />
      <JsonLd data={fixedPageJsonLd("real-estate-development", resolvePageSeo("real-estate-development", page?.seo))} />
    </>
  );
}
