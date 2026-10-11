import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { queryOne } from "@/lib/db";
import NewsArticleView, { type NewsArticle } from "@/components/site/NewsArticleView";
import "../../../news/news.css";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Draft preview", robots: { index: false, follow: false } };

/** Signed-in preview of a news post in any status (draft / in review / published). */
export default async function NewsPreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!(await getSession())) redirect(`/admin/login?next=/preview/news/${id}`);
  const postId = Number(id);
  if (!Number.isInteger(postId)) notFound();

  let post: (NewsArticle & { status: string }) | null = null;
  try {
    post = await queryOne(
      "SELECT title, excerpt, body, cover_image, category, published_at, status FROM news_posts WHERE id = $1",
      [postId]
    );
  } catch {
    post = null;
  }
  if (!post) notFound();

  return (
    <>
      <div style={{ background: "#fdf0d4", color: "#6b4a00", padding: "10px 20px", fontSize: ".85rem", fontWeight: 700, textAlign: "center" }}>
        Preview — status: {post.status.replace("_", " ")}. This page is not visible to the public{post.status === "published" ? " in this form" : ""}.{" "}
        <a href={`/admin/news/${postId}`} style={{ textDecoration: "underline" }}>Back to editor</a>
      </div>
      <NewsArticleView post={post} />
    </>
  );
}
