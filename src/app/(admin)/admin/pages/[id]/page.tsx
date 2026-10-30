import { redirect } from "next/navigation";
import VersionHistory from "@/components/admin/VersionHistory";
import PageEditor from "./PageEditor";
import { queryOne } from "@/lib/db";
import { isLegalSlug } from "@/lib/legal-content";

export const dynamic = "force-dynamic";

type PageRow = {
  id: number;
  slug: string;
  title: string;
  status: string;
  content: { meta?: string; body?: string } | null;
  seo: { title?: string; description?: string } | null;
};

async function getPage(id: string): Promise<PageRow | null> {
  try {
    return await queryOne<PageRow>(
      "SELECT id, slug, title, status, content, seo FROM pages WHERE id = $1",
      [Number(id)]
    );
  } catch {
    return null;
  }
}

export default async function PageEditRoute({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const isNew = id === "new";
  const page = isNew ? null : await getPage(id);
  if (page && isLegalSlug(page.slug)) redirect(`/admin/site/legal/${page.slug}`);

  return (
    <>
      <h1 style={{ fontSize: "1.6rem", marginBottom: 6 }}>{isNew ? "New Page" : "Edit Page"}</h1>
      {isNew || page ? (
        <PageEditor page={page} />
      ) : (
        <div className="card">Page not found (or database unavailable).</div>
      )}
    {page ? <VersionHistory entity="page" entityId={page.slug} /> : null}
    </>
  );
}
