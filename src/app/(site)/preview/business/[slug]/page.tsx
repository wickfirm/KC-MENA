import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getPageBySlug } from "@/lib/pages";
import { loadDraft } from "@/lib/preview-drafts";
import { DEFAULT_BUSINESS_DETAILS, isBusinessDetailContent, isBusinessDetailSlug } from "@/lib/business-detail-content";
import BusinessDetailPageView from "@/components/site/BusinessDetailPageView";
import PreviewBanner from "@/components/site/PreviewBanner";

export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false, follow: false } };

export default async function BusinessDraftPreview({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ draft?: string }> }) {
  if (!await getSession()) redirect("/admin/login");
  const { slug } = await params;
  if (!isBusinessDetailSlug(slug)) notFound();
  const draft = (await searchParams).draft ? ((await loadDraft(`page:business/${slug}`)) as { content?: unknown } | null) : null;
  const source = draft ? draft.content : (await getPageBySlug(slug, false))?.content;
  return <><PreviewBanner unsaved={Boolean(draft)} editHref={`/admin/site/business/${slug}`} /><BusinessDetailPageView page={slug} content={isBusinessDetailContent(source) ? source : DEFAULT_BUSINESS_DETAILS[slug]} /></>;
}
