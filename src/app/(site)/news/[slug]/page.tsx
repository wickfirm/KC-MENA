import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { queryOne } from "@/lib/db";
import NewsArticleView from "@/components/site/NewsArticleView";
import "../news.css";

export const dynamic = "force-dynamic";

type Post = {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  cover_image: string | null;
  category: string | null;
  published_at: string | null;
};

async function getPost(slug: string): Promise<Post | null> {
  try {
    return await queryOne<Post>(
      `SELECT id, slug, title, excerpt, body, cover_image, category, published_at
       FROM news_posts WHERE slug = $1 AND status = 'published'`,
      [slug]
    );
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: "News" };
  return {
    title: post.title,
    description: post.excerpt || undefined,
    alternates: { canonical: `https://kasumigaseki.ae/news/${post.slug}` },
  };
}

export default async function NewsArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  return <NewsArticleView post={post} />;
}
