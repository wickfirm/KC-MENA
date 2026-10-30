import VersionHistory from "@/components/admin/VersionHistory";
import { queryOne } from "@/lib/db";
import MissingCmsContent from "@/components/admin/MissingCmsContent";
import { readHomeContent } from "@/lib/home-content";
import HomeEditor from "./HomeEditor";

export const dynamic = "force-dynamic";

type HomePageRow = { status: "draft" | "published"; content: unknown; seo: { title?: string; description?: string } | null };

export default async function HomeAdminPage() {
  let page: HomePageRow | null = null;
  try { page = await queryOne<HomePageRow>("SELECT status, content, seo FROM pages WHERE slug = 'home'"); } catch {}
  const content = readHomeContent(page?.content);
  return <><h1 style={{ fontSize: "1.6rem", marginBottom: 6 }}>Home page</h1><p style={{ color: "var(--grey-5)", marginBottom: 22 }}>Edit the visible Home page sections. Your changes stay in draft until you publish them.</p>{content ? <HomeEditor content={content} status={page?.status ?? "draft"} seo={page?.seo ?? {}} /> : <MissingCmsContent name="Home page" />}<VersionHistory entity="page" entityId="home" /></>;
}
