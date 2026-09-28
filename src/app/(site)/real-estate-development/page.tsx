import type { Metadata } from "next";
import { getPageBySlug } from "@/lib/pages";
import { DEFAULT_BUSINESS_DETAILS, isBusinessDetailContent, withBusinessDefaults } from "@/lib/business-detail-content";
import { getPublishedProjectsBySector } from "@/lib/projects";
import BusinessDetailPageView from "@/components/site/BusinessDetailPageView";
import "../styles/business-dev.css";

export const dynamic = "force-dynamic";
export async function generateMetadata(): Promise<Metadata> { const page = await getPageBySlug("real-estate-development"); return { title: page?.seo?.title || "Development", description: page?.seo?.description, alternates: { canonical: "https://kasumigaseki.ae/real-estate-development/" } }; }

export default async function Page() {
  const [page, projects] = await Promise.all([getPageBySlug("real-estate-development"), getPublishedProjectsBySector("real-estate-development")]);
  return <BusinessDetailPageView content={withBusinessDefaults("real-estate-development", isBusinessDetailContent(page?.content) ? page.content : DEFAULT_BUSINESS_DETAILS["real-estate-development"])} projects={projects} />;
}
