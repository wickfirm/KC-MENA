import { notFound } from "next/navigation";
import { queryOne } from "@/lib/db";
import {
  DEFAULT_BUSINESS_DETAILS,
  isBusinessDetailContent,
  isBusinessDetailSlug,
} from "@/lib/business-detail-content";
import BusinessDetailEditor from "./BusinessDetailEditor";

export const dynamic = "force-dynamic";

export default async function BusinessPageAdmin({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!isBusinessDetailSlug(slug)) notFound();
  let page: { status: "draft" | "published"; content: unknown; seo: { title?: string; description?: string } | null } | null = null;
  try { page = await queryOne("SELECT status, content, seo FROM pages WHERE slug = $1", [slug]); } catch { /* editor uses supplied fallback until the database is configured */ }
  const content = isBusinessDetailContent(page?.content) ? page.content : DEFAULT_BUSINESS_DETAILS[slug];
  return <>
    <h1 style={{ fontSize: "1.6rem", marginBottom: 6 }}>{content.hero.title}</h1>
    <p style={{ color: "var(--grey-5)", marginBottom: 22 }}>Edit the supplied business template. Changes remain a draft until published.</p>
    <BusinessDetailEditor slug={slug} content={content} status={page?.status ?? "draft"} seo={page?.seo ?? {}} />
  </>;
}
