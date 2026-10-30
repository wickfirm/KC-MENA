import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getPageBySlug } from "@/lib/pages";
import { loadDraft } from "@/lib/preview-drafts";
import { isLocalBusinessContent } from "@/lib/local-business-content";
import LocalBusinessPageView from "@/components/site/LocalBusinessPageView";
import PreviewBanner from "@/components/site/PreviewBanner";

export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false, follow: false } };

export default async function LocalBusinessDraftPreview({ searchParams }: { searchParams: Promise<{ draft?: string }> }) {
  if (!await getSession()) redirect("/admin/login");
  const draft = (await searchParams).draft ? ((await loadDraft("page:local-business")) as { content?: unknown } | null) : null;
  const source = draft ? draft.content : (await getPageBySlug("local-business", false))?.content;
  if (!isLocalBusinessContent(source)) notFound();
  return <><PreviewBanner unsaved={Boolean(draft)} editHref="/admin/site/local-business" /><LocalBusinessPageView content={source} /></>;
}
