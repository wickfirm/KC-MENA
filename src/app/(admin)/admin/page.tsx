import Link from "next/link";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

type Counts = {
  news_published: number;
  news_draft: number;
  pages_published: number;
  faqs: number;
  jobs_open: number;
  subs_pending: number;
  rss_pending: number;
};

export default async function AdminDashboard() {
  let counts: Counts | null = null;
  let dbError: string | null = null;
  try {
    const rows = await query<Counts>(`
      SELECT
        (SELECT COUNT(*) FROM news_posts WHERE status = 'published')          AS news_published,
        (SELECT COUNT(*) FROM news_posts WHERE status <> 'published')         AS news_draft,
        (SELECT COUNT(*) FROM pages WHERE status = 'published')               AS pages_published,
        (SELECT COUNT(*) FROM faqs)                                           AS faqs,
        (SELECT COUNT(*) FROM job_openings WHERE status = 'open')             AS jobs_open,
        (SELECT COUNT(*) FROM contact_submissions WHERE sf_sync_status = 'pending') AS subs_pending,
        (SELECT COUNT(*) FROM rss_items WHERE status = 'pending')             AS rss_pending
    `);
    counts = rows[0] ?? null;
  } catch (err) {
    dbError = err instanceof Error ? err.message : "Database unavailable";
  }

  const cards = counts
    ? [
        { label: "Published News", value: counts.news_published, href: "/admin/news" },
        { label: "News Drafts", value: counts.news_draft, href: "/admin/news" },
        { label: "Published Pages", value: counts.pages_published, href: "/admin/pages" },
        { label: "FAQs", value: counts.faqs, href: "/admin/faqs" },
        { label: "Open Jobs", value: counts.jobs_open, href: "/admin/jobs" },
        { label: "Unsynced Leads", value: counts.subs_pending, href: "/admin/submissions" },
        { label: "RSS Pending Review", value: counts.rss_pending, href: "/admin/rss" },
      ]
    : [];

  return (
    <>
      <h1 style={{ fontSize: "1.6rem", marginBottom: 4 }}>Dashboard</h1>
      <p style={{ color: "var(--grey-5)", marginBottom: 26 }}>
        Kasumigaseki Capital MENA — content overview
      </p>

      {dbError && (
        <div className="card" style={{ borderLeft: "4px solid #b5342c", marginBottom: 24 }}>
          <strong>Database not connected.</strong>
          <p style={{ color: "var(--grey-5)", marginTop: 4 }}>
            Set <code>DATABASE_URL</code> (Vercel Postgres) and apply <code>db/schema.sql</code>.
            <br />Detail: {dbError}
          </p>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 14 }}>
        {cards.map((c) => (
          <Link key={c.label} href={c.href} className="card" style={{ display: "block" }}>
            <p style={{ fontSize: "2rem", fontWeight: 700 }}>{c.value}</p>
            <p style={{ fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--grey-5)" }}>
              {c.label}
            </p>
          </Link>
        ))}
      </div>
    </>
  );
}
