import NewsEditor from "./NewsEditor";
import { queryOne } from "@/lib/db";

export const dynamic = "force-dynamic";

export type NewsPost = {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  cover_image: string | null;
  category: string | null;
  status: string;
};

async function getPost(id: string): Promise<NewsPost | null> {
  try {
    return await queryOne<NewsPost>(
      "SELECT id, slug, title, excerpt, body, cover_image, category, status FROM news_posts WHERE id = $1",
      [Number(id)]
    );
  } catch {
    return null;
  }
}

export default async function NewsEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const isNew = id === "new";
  const post = isNew ? null : await getPost(id);

  return (
    <>
      <h1 style={{ fontSize: "1.6rem", marginBottom: 22 }}>
        {isNew ? "New News Post" : "Edit News Post"}
      </h1>
      {isNew || post ? (
        <NewsEditor post={post} />
      ) : (
        <div className="card">Post not found (or database unavailable).</div>
      )}
    </>
  );
}
