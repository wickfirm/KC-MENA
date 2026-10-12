import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getPageBySlug } from "@/lib/pages";
import { loadDraft } from "@/lib/preview-drafts";
import { DEFAULT_LISTING_CONTENT, isListingContent, isListingSlug } from "@/lib/listing-content";
import ListingPageShell from "@/components/site/ListingPageShell";
import PreviewBanner from "@/components/site/PreviewBanner";

export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false, follow: false } };

export default async function ListingDraftPreview({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ draft?: string }> }) {
  if (!await getSession()) redirect("/admin/login");
  const { slug } = await params;
  if (!isListingSlug(slug)) notFound();
  const draft = (await searchParams).draft ? ((await loadDraft(`page:listing/${slug}`)) as { content?: unknown } | null) : null;
  const source = draft ? draft.content : (await getPageBySlug(slug, false))?.content;
  return <><PreviewBanner unsaved={Boolean(draft)} editHref={`/admin/site/listing/${slug}`} /><ListingPageShell page={slug === "careers" ? "careers" : "news"} content={isListingContent(source) ? source : DEFAULT_LISTING_CONTENT[slug]} /></>;
}
