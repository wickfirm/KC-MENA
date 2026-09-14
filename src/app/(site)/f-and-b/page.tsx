import type { Metadata } from "next";
import { getPageBySlug } from "@/lib/pages";
import { DEFAULT_BUSINESS_DETAILS, isBusinessDetailContent } from "@/lib/business-detail-content";
import BusinessDetailPageView from "@/components/site/BusinessDetailPageView";

export const dynamic = "force-dynamic";
export async function generateMetadata(): Promise<Metadata> { const page = await getPageBySlug("f-and-b"); return { title: page?.seo?.title || "Food & Beverage", description: page?.seo?.description, alternates: { canonical: "https://kasumigaseki.ae/f-and-b/" } }; }

export default async function Page() {
  const page = await getPageBySlug("f-and-b");
  return <BusinessDetailPageView content={isBusinessDetailContent(page?.content) ? page.content : DEFAULT_BUSINESS_DETAILS["f-and-b"]} />;
}
