import type { Metadata } from "next";
import JsonLd from "@/components/site/JsonLd";
import { fixedPageJsonLd, pageMetadata, resolvePageSeo } from "@/lib/seo";
import { getPageBySlug } from "@/lib/pages";
import { DEFAULT_BUSINESS_DETAILS, isBusinessDetailContent, withBusinessDefaults } from "@/lib/business-detail-content";
import { getPublishedProjectsBySector } from "@/lib/projects";
import BusinessDetailPageView from "@/components/site/BusinessDetailPageView";

export const dynamic = "force-dynamic";
export async function generateMetadata(): Promise<Metadata> { const page = await getPageBySlug("f-and-b"); return pageMetadata(resolvePageSeo("f-and-b", page?.seo)); }

export default async function Page() {
  const [page, projects] = await Promise.all([getPageBySlug("f-and-b"), getPublishedProjectsBySector("f-and-b")]);
  return (
    <>
      <BusinessDetailPageView page="f-and-b" content={withBusinessDefaults("f-and-b", isBusinessDetailContent(page?.content) ? page.content : DEFAULT_BUSINESS_DETAILS["f-and-b"])} projects={projects} referenceOverviewWidth />
      <JsonLd data={fixedPageJsonLd("f-and-b", resolvePageSeo("f-and-b", page?.seo))} />
    </>
  );
}
