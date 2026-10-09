import type { Metadata } from "next";
import { query } from "@/lib/db";
import { getListingContent } from "@/lib/listing-content";
import JobApplyForm from "@/components/site/JobApplyForm";
import OpenApplicationForm from "@/components/site/OpenApplicationForm";
import "./careers.css";

export const dynamic = "force-dynamic";

type Job = { id: number; title: string; department: string | null; location: string | null; employment: string | null; description: string | null };

export async function generateMetadata(): Promise<Metadata> {
  const content = await getListingContent("careers");
  return { title: content.hero.title, description: content.intro, alternates: { canonical: "https://kasumigaseki.ae/careers/" } };
}

export default async function CareersPage() {
  const content = await getListingContent("careers");
  let jobs: Job[] = [];
  try { jobs = await query("SELECT id, title, department, location, employment, description FROM job_openings WHERE status = 'open' AND (closing_date IS NULL OR closing_date >= current_date) ORDER BY created_at DESC"); } catch { /* The template remains useful before the CMS database is connected. */ }
  return <main>
    <section className="hero-band" style={{ "--hero-image": `url('${content.hero.image}')` } as React.CSSProperties}>
      <div className="wrap"><h1>{content.hero.title}</h1></div>
    </section>
    {jobs.length ? (
      <section className="section">
        <div className="wrap">
        <div style={{ display: "grid", gap: 1, borderTop: "1px solid var(--line)", marginTop: 30 }}>
          {jobs.map((job) => (
            <article key={job.id} style={{ padding: "24px 0", borderBottom: "1px solid var(--line)", display: "grid", gridTemplateColumns: "1fr auto", gap: 20, alignItems: "center" }}>
              <div>
                <h3 style={{ fontSize: "1.25rem" }}>{job.title}</h3>
                <p style={{ color: "var(--grey-5)", marginTop: 6 }}>{[job.department, job.location, job.employment].filter(Boolean).join(" · ")}</p>
                {job.description && <p style={{ marginTop: 10, maxWidth: 720 }}>{job.description}</p>}
              </div>
              <JobApplyForm jobId={job.id} jobTitle={job.title} />
            </article>
          ))}
        </div>
        </div>
      </section>
    ) : null}
    <OpenApplicationForm content={content.careerForm} />
  </main>;
}
