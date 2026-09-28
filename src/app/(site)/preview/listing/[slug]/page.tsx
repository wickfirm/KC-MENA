import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getPageBySlug } from "@/lib/pages";
import { DEFAULT_LISTING_CONTENT, isListingContent, isListingSlug } from "@/lib/listing-content";
import ListingPageShell from "@/components/site/ListingPageShell";

export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false, follow: false } };

export default async function ListingDraftPreview({ params }: { params: Promise<{ slug: string }> }) {
  if (!await getSession()) redirect("/admin/login");
  const { slug } = await params;
  if (!isListingSlug(slug)) notFound();
  const page = await getPageBySlug(slug, false);
  return <ListingPageShell content={isListingContent(page?.content) ? page.content : DEFAULT_LISTING_CONTENT[slug]} />;
}