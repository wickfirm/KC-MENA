import type { Metadata } from "next";
import JsonLd from "@/components/site/JsonLd";
import { fixedPageJsonLd, pageMetadata, resolvePageSeo } from "@/lib/seo";
import { getPageBySlug } from "@/lib/pages";
import { DEFAULT_BUSINESS_DETAILS, isBusinessDetailContent, withBusinessDefaults } from "@/lib/business-detail-content";
import { getPublishedProjectsBySector } from "@/lib/projects";
import BusinessDetailPageView from "@/components/site/BusinessDetailPageView";
import "../styles/business.css";

export const dynamic = "force-dynamic";
export async function generateMetadata(): Promise<Metadata> { const page = await getPageBySlug("real-estate"); return pageMetadata(resolvePageSeo("real-estate", page?.seo)); }

export default async function Page() {
  const [page, projects] = await Promise.all([getPageBySlug("real-estate"), getPublishedProjectsBySector("real-estate")]);
  return (
    <>
      <BusinessDetailPageView content={withBusinessDefaults("real-estate", isBusinessDetailContent(page?.content) ? page.content : DEFAULT_BUSINESS_DETAILS["real-estate"])} projects={projects} referenceOverviewWidth />
      <JsonLd data={fixedPageJsonLd("real-estate", resolvePageSeo("real-estate", page?.seo))} />
    </>
  );
}
