import type { Metadata } from "next";
import { getPageBySlug } from "@/lib/pages";
import { DEFAULT_BUSINESS_DETAILS, isBusinessDetailContent } from "@/lib/business-detail-content";
import BusinessDetailPageView from "@/components/site/BusinessDetailPageView";

export const dynamic = "force-dynamic";
export async function generateMetadata(): Promise<Metadata> { const page = await getPageBySlug("real-estate"); return { title: page?.seo?.title || "Investment & Asset Management", description: page?.seo?.description, alternates: { canonical: "https://kasumigaseki.ae/real-estate/" } }; }

export default async function Page() {
  const page = await getPageBySlug("real-estate");
  return <BusinessDetailPageView content={isBusinessDetailContent(page?.content) ? page.content : DEFAULT_BUSINESS_DETAILS["real-estate"]} />;
}
