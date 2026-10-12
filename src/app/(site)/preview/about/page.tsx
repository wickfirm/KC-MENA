import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getPageBySlug } from "@/lib/pages";
import { loadDraft } from "@/lib/preview-drafts";
import { DEFAULT_ABOUT_CONTENT, isAboutContent } from "@/lib/about-content";
import AboutPageView from "@/components/site/AboutPageView";
import PreviewBanner from "@/components/site/PreviewBanner";

export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false, follow: false } };

export default async function AboutDraftPreview({ searchParams }: { searchParams: Promise<{ draft?: string }> }) {
  if (!await getSession()) redirect("/admin/login");
  const draft = (await searchParams).draft ? ((await loadDraft("page:about")) as { content?: unknown } | null) : null;
  const source = draft ? draft.content : (await getPageBySlug("about-us", false))?.content;
  return <><PreviewBanner unsaved={Boolean(draft)} editHref="/admin/site/about" /><AboutPageView content={isAboutContent(source) ? source : DEFAULT_ABOUT_CONTENT} /></>;
}
