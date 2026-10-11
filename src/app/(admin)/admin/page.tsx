import Link from "next/link";
import { query } from "@/lib/db";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

type Counts = {
  news_published: number;
  news_draft: number;
  news_review: number;
  pages_published: number;
  faqs: number;
  jobs_open: number;
  subs_week: number;
  subs_failed: number;
  rss_pending: number;
};

type Recent = { id: number; summary: string; actor_name: string | null; actor_email: string | null; created_at: string };

const QUICK_ACTIONS = [
  { title: "Write a news post", description: "Share an update, award or milestone.", href: "/admin/news/new" },
  { title: "Edit the Home page", description: "Hero, intro and highlights.", href: "/admin/site/home" },
  { title: "Upload media", description: "Add images or PDFs, then copy the link.", href: "/admin/media" },
  { title: "Review submissions", description: "Enquiries and applications from the site.", href: "/admin/submissions" },
];

export default async function AdminDashboard({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const denied = (await searchParams).denied;
  const session = await getSession();
  let counts: Counts | null = null;
  let recent: Recent[] = [];
  let dbError: string | null = null;
  try {
    const rows = await query<Counts>(`
      SELECT
        (SELECT COUNT(*)::int FROM news_posts WHERE status = 'published')                      AS news_published,
        (SELECT COUNT(*)::int FROM news_posts WHERE status <> 'published')                     AS news_draft,
        (SELECT COUNT(*)::int FROM news_posts WHERE status = 'in_review')                      AS news_review,
        (SELECT COUNT(*)::int FROM pages WHERE status = 'published')                           AS pages_published,
        (SELECT COUNT(*)::int FROM faqs)                                                       AS faqs,
        (SELECT COUNT(*)::int FROM job_openings WHERE status = 'open')                         AS jobs_open,
        (SELECT COUNT(*)::int FROM contact_submissions WHERE created_at > now() - interval '7 days') AS subs_week,
        (SELECT COUNT(*)::int FROM contact_submissions WHERE sf_sync_status = 'failed')        AS subs_failed,
        (SELECT COUNT(*)::int FROM rss_items WHERE status = 'pending')                         AS rss_pending
    `);
    counts = rows[0] ?? null;
  } catch (err) {
    dbError = err instanceof Error ? err.message : "Database unavailable";
  }
  if (session?.role === "admin") {
    // Governance tables may not exist on a fresh database; the dashboard must still render.
    try {
      recent = await query<Recent>(
        "SELECT id, summary, actor_name, actor_email, created_at FROM activity_log ORDER BY created_at DESC, id DESC LIMIT 8"
      );
    } catch {
      recent = [];
    }
  }

  const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;
  const attention = counts
    ? [
        counts.news_review > 0 && { label: `${plural(counts.news_review, "news post")} waiting for review`, href: "/admin/news", cta: "Review" },
        counts.rss_pending > 0 && { label: `${plural(counts.rss_pending, "press item")} pending in the RSS queue`, href: "/admin/rss", cta: "Open queue" },
        counts.subs_failed > 0 && { label: `${plural(counts.subs_failed, "submission")} could not reach Salesforce`, href: "/admin/submissions?sync=failed", cta: "Inspect" },
        counts.subs_week > 0 && { label: `${plural(counts.subs_week, "new submission")} in the last 7 days`, href: "/admin/submissions", cta: "Open inbox" },
      ].filter(Boolean) as { label: string; href: string; cta: string }[]
    : [];

  const cards = counts
    ? [
        { label: "Published News", value: counts.news_published, href: "/admin/news" },
        { label: "News Drafts", value: counts.news_draft, href: "/admin/news" },
        { label: "Published Pages", value: counts.pages_published, href: "/admin/pages" },
        { label: "FAQs", value: counts.faqs, href: "/admin/faqs" },
        { label: "Open Jobs", value: counts.jobs_open, href: "/admin/jobs" },
        { label: "Submissions (7 days)", value: counts.subs_week, href: "/admin/submissions" },
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

      {denied && (
        <div className="card" style={{ borderLeft: "4px solid #9a6b00", marginBottom: 24 }}>
          That area is for administrators only.
        </div>
      )}

      {attention.length > 0 && (
        <section style={{ marginBottom: 28 }} aria-labelledby="attention-h">
          <h2 id="attention-h" style={{ fontSize: "1rem", marginBottom: 10 }}>Needs your attention</h2>
          <div style={{ display: "grid", gap: 8 }}>
            {attention.map((item) => (
              <div key={item.label} className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, padding: "12px 18px", borderLeft: "4px solid #9a6b00" }}>
                <span>{item.label}</span>
                <Link href={item.href} className="btn" style={{ padding: "5px 12px", fontSize: "0.7rem" }}>{item.cta}</Link>
              </div>
            ))}
          </div>
        </section>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 14, marginBottom: 28 }}>
        {cards.map((c) => (
          <Link key={c.label} href={c.href} className="card" style={{ display: "block" }}>
            <p style={{ fontSize: "2rem", fontWeight: 700 }}>{c.value}</p>
            <p style={{ fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--grey-5)" }}>
              {c.label}
            </p>
          </Link>
        ))}
      </div>

      <section style={{ marginBottom: 28 }} aria-labelledby="quick-h">
        <h2 id="quick-h" style={{ fontSize: "1rem", marginBottom: 10 }}>Quick actions</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 14 }}>
          {QUICK_ACTIONS.map((a) => (
            <Link key={a.href} href={a.href} className="card" style={{ display: "block" }}>
              <strong>{a.title}</strong>
              <p style={{ color: "var(--grey-5)", fontSize: "0.82rem", marginTop: 4 }}>{a.description}</p>
            </Link>
          ))}
        </div>
      </section>

      {session?.role === "admin" && recent.length > 0 && (
        <section aria-labelledby="recent-h">
          <h2 id="recent-h" style={{ fontSize: "1rem", marginBottom: 10 }}>Recent activity</h2>
          <div className="card" style={{ padding: 0 }}>
            {recent.map((r) => (
              <div key={r.id} style={{ display: "flex", justifyContent: "space-between", gap: 16, padding: "10px 18px", borderTop: "1px solid var(--line)", fontSize: "0.85rem" }}>
                <span>
                  {r.summary}
                  <span style={{ color: "var(--grey-5)" }}> · {r.actor_name || r.actor_email || "system"}</span>
                </span>
                <span style={{ color: "var(--grey-5)", whiteSpace: "nowrap" }}>{new Date(r.created_at).toLocaleString("en-GB")}</span>
              </div>
            ))}
          </div>
          <p style={{ marginTop: 10 }}><Link href="/admin/activity" style={{ textDecoration: "underline" }}>See the full activity log →</Link></p>
        </section>
      )}
    </>
  );
}
