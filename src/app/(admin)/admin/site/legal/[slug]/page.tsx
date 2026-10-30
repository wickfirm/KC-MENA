import { notFound } from "next/navigation";
import VersionHistory from "@/components/admin/VersionHistory";
import { queryOne } from "@/lib/db";
import MissingCmsContent from "@/components/admin/MissingCmsContent";
import { LEGAL_PAGE_TITLES, isLegalSlug, readLegalContent } from "@/lib/legal-content";
import LegalEditor from "./LegalEditor";

export const dynamic = "force-dynamic";

export default async function LegalAdminPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!isLegalSlug(slug)) notFound();
  let page: { status: "draft" | "published"; title: string; content: unknown; seo: { title?: string; description?: string } | null } | null = null;
  try {
    page = await queryOne("SELECT status, title, content, seo FROM pages WHERE slug = $1", [slug]);
  } catch { /* the editor falls back to the client HTML */ }
  const content = readLegalContent(page?.content);
  return (
    <>
      <h1 style={{ fontSize: "1.6rem", marginBottom: 6 }}>{LEGAL_PAGE_TITLES[slug]}</h1>
      <p style={{ color: "var(--grey-5)", marginBottom: 22 }}>Edit each section as fields. Links stay attached to the words they belong to.</p>
      {content ? <LegalEditor slug={slug} content={content} status={page?.status ?? "published"} seo={page?.seo ?? {}} /> : <MissingCmsContent name={LEGAL_PAGE_TITLES[slug]} />}
      <VersionHistory entity="page" entityId={slug} />
    </>
  );
}
