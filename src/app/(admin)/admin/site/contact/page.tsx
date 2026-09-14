import { queryOne } from "@/lib/db";
import { DEFAULT_CONTACT_CONTENT, isContactContent } from "@/lib/contact-content";
import ContactEditor from "./ContactEditor";
export const dynamic = "force-dynamic";
export default async function ContactAdminPage() { let page: { status: "draft" | "published"; content: unknown; seo: { title?: string; description?: string } | null } | null = null; try { page = await queryOne("SELECT status, content, seo FROM pages WHERE slug='contact-us'"); } catch {} return <><h1 style={{ fontSize: "1.6rem", marginBottom: 6 }}>Contact Us</h1><p style={{ color: "var(--grey-5)", marginBottom: 22 }}>Manage contact-page copy and location cards. Enquiries remain email-client based until Phase 3.</p><ContactEditor content={isContactContent(page?.content) ? page.content : DEFAULT_CONTACT_CONTENT} status={page?.status ?? "draft"} seo={page?.seo ?? {}} /></>; }
