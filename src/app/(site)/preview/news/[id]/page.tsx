import ClientPageCss from "@/components/site/ClientPageCss";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { queryOne } from "@/lib/db";
import { loadDraft } from "@/lib/preview-drafts";
import NewsArticleView, { type NewsArticle } from "@/components/site/NewsArticleView";
import PreviewBanner from "@/components/site/PreviewBanner";
import "../../../news/news.css";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Draft preview", robots: { index: false, follow: false } };

type Draft = { title?: string; excerpt?: string; body?: string; cover_image?: string | null; category?: string | null; status?: string; published_at?: string | null };

/** Signed-in preview of a news post in any status, optionally with the unsaved changes from the editor (?draft=1). */
export default async function NewsPreviewPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ draft?: string }> }) {
  const { id } = await params;
  if (!(await getSession())) redirect(`/admin/login?next=/preview/news/${id}`);
  const wantsDraft = Boolean((await searchParams).draft);
  const draft = wantsDraft ? ((await loadDraft(`news:${id}`)) as Draft | null) : null;

  let post: (NewsArticle & { status: string }) | null = null;
  if (draft && typeof draft.title === "string") {
    post = {
      title: draft.title || "Untitled",
      excerpt: draft.excerpt ?? "",
      body: draft.body ?? "",
      cover_image: draft.cover_image || null,
      category: draft.category || null,
      published_at: draft.published_at ?? null,
      status: draft.status ?? "draft",
    };
  } else {
    const postId = Number(id);
    if (!Number.isInteger(postId)) notFound();
    try {
      post = await queryOne("SELECT title, excerpt, body, cover_image, category, published_at, status FROM news_posts WHERE id = $1", [postId]);
    } catch {
      post = null;
    }
  }
  if (!post) notFound();

  return (
    <><ClientPageCss page="news" />
      <PreviewBanner
        unsaved={Boolean(draft)}
        editHref={id === "new" ? "/admin/news/new" : `/admin/news/${id}`}
        note={`Status: ${post.status.replace("_", " ")}. This page is not visible to the public in this form.`}
      />
      <NewsArticleView post={post} />
    </>
  );
}
