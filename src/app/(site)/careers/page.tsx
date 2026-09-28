import type { Metadata } from "next";
import Link from "next/link";
import { query } from "@/lib/db";
import { getListingContent } from "@/lib/listing-content";
import ListingPageShell from "@/components/site/ListingPageShell";
import JobApplyForm from "@/components/site/JobApplyForm";

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
    <ListingPageShell content={content}>
      {jobs.length ? (
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
      ) : (
        <p style={{ maxWidth: 650, marginTop: 24, color: "var(--grey-5)" }}>{content.emptyMessage}</p>
      )}
    </ListingPageShell>
    <section className="section" style={{ background: "var(--grey-1)" }}><div className="wrap"><span className="eyebrow">Application Form</span><h2 style={{ marginTop: 12 }}>Tell us where you&apos;d fit.</h2><p style={{ maxWidth: 620, marginTop: 12 }}>Use the Apply button on any open role above — your application goes straight to our team. You can also introduce yourself through the contact page.</p><Link href="/contact-us/" className="btn btn-solid" style={{ marginTop: 22 }}>Get in touch</Link></div></section>
  </main>;
}
