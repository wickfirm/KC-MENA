import type { Metadata } from "next";
import Link from "next/link";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Careers", alternates: { canonical: "https://kasumigaseki.ae/careers/" } };

type Job = { id: number; title: string; department: string | null; location: string | null; employment: string | null; description: string | null };

export default async function CareersPage() {
  let jobs: Job[] = [];
  try { jobs = await query("SELECT id, title, department, location, employment, description FROM job_openings WHERE status = 'open' AND (closing_date IS NULL OR closing_date >= current_date) ORDER BY created_at DESC"); } catch { /* The template remains useful before the CMS database is connected. */ }
  return <main>
    <section className="hero-band" style={{ "--hero-image": "url('/images/office.webp')" } as React.CSSProperties}><div className="wrap"><h1>Careers</h1></div></section>
    <section className="section"><div className="wrap"><span className="eyebrow">Opportunities</span><div className="head"><h2>Build the next chapter with us.</h2></div>
      {jobs.length ? <div style={{ display: "grid", gap: 1, borderTop: "1px solid var(--line)", marginTop: 30 }}>{jobs.map((job) => <article key={job.id} style={{ padding: "24px 0", borderBottom: "1px solid var(--line)", display: "grid", gridTemplateColumns: "1fr auto", gap: 20, alignItems: "center" }}><div><h3 style={{ fontSize: "1.25rem" }}>{job.title}</h3><p style={{ color: "var(--grey-5)", marginTop: 6 }}>{[job.department, job.location, job.employment].filter(Boolean).join(" · ")}</p>{job.description && <p style={{ marginTop: 10, maxWidth: 720 }}>{job.description}</p>}</div><a className="btn btn-outline" href={`mailto:info.dubai@kasumigaseki.co.jp?subject=${encodeURIComponent(`Application: ${job.title}`)}`}>Apply</a></article>)}</div> : <p style={{ maxWidth: 650, marginTop: 20 }}>There are no open roles listed today. We welcome thoughtful introductions from people interested in building across our regional platform.</p>}
    </div></section>
    <section className="section" style={{ background: "var(--grey-1)" }}><div className="wrap"><span className="eyebrow">Application Form</span><h2 style={{ marginTop: 12 }}>Tell us where you&apos;d fit.</h2><p style={{ maxWidth: 620, marginTop: 12 }}>Complete the form below and a member of our team will be in touch using the details you provide.</p><Link href="/contact-us/" className="btn btn-solid" style={{ marginTop: 22 }}>Get in touch</Link></div></section>
  </main>;
}
