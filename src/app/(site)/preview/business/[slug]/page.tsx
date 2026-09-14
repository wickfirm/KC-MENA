import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getPageBySlug } from "@/lib/pages";
import { DEFAULT_BUSINESS_DETAILS, isBusinessDetailContent, isBusinessDetailSlug } from "@/lib/business-detail-content";
import BusinessDetailPageView from "@/components/site/BusinessDetailPageView";

export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false, follow: false } };

export default async function BusinessDraftPreview({ params }: { params: Promise<{ slug: string }> }) {
  if (!await getSession()) redirect("/admin/login");
  const { slug } = await params;
  if (!isBusinessDetailSlug(slug)) notFound();
  const page = await getPageBySlug(slug, false);
  return <BusinessDetailPageView content={isBusinessDetailContent(page?.content) ? page.content : DEFAULT_BUSINESS_DETAILS[slug]} />;
}
