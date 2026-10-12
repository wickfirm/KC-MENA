import type { Metadata } from "next";
import { redirect } from "next/navigation";
import HomePageView from "@/components/site/HomePageView";
import PreviewBanner from "@/components/site/PreviewBanner";
import { getSession } from "@/lib/auth";
import { getPageBySlug } from "@/lib/pages";
import { loadDraft } from "@/lib/preview-drafts";
import { DEFAULT_HOME_CONTENT } from "@/lib/home-content";
import { validateModuleDocument, type ModuleDocument } from "@/lib/content-modules";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Home preview", robots: { index: false, follow: false } };

export default async function HomePreviewPage({ searchParams }: { searchParams: Promise<{ draft?: string }> }) {
  if (!await getSession()) redirect("/admin/login?next=/preview/home");
  const draft = (await searchParams).draft ? ((await loadDraft("page:home")) as { content?: unknown } | null) : null;
  const page = draft ? null : await getPageBySlug("home", false);
  const source = draft ? draft.content : page?.content;
  const document = validateModuleDocument(source).length === 0 ? source as ModuleDocument : DEFAULT_HOME_CONTENT;
  return <><PreviewBanner unsaved={Boolean(draft)} editHref="/admin/site/home" /><HomePageView document={document} /></>;
}
