import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Contact Us", alternates: { canonical: "https://kasumigaseki.ae/contact-us/" } };

const locations = [
  ["Dubai Office", "Dubai Hills Estate\nBusiness Park 4, Office 304-305\nDubai, UAE"],
  ["Sales Centre", "Business Bay\nDubai, UAE"],
  ["Miami Location", "Miami, Florida\nUnited States"],
  ["Kasumigaseki Restaurant", "Vida Emirates Hills\nDubai, UAE"],
];

export default function ContactPage() {
  return <main><section className="hero-band" style={{ "--hero-image": "url('/images/office.webp')" } as React.CSSProperties}><div className="wrap"><h1>Contact Us</h1></div></section>
    <section className="section"><div className="wrap"><span className="eyebrow">Our locations</span><div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 18, marginTop: 24 }}>{locations.map(([title, address]) => <article className="card" key={title}><h2 style={{ fontSize: "1.2rem" }}>{title}</h2><p style={{ whiteSpace: "pre-line", marginTop: 10, color: "var(--grey-6)" }}>{address}</p></article>)}</div></div></section>
    <section className="section" style={{ background: "var(--grey-1)" }}><div className="wrap" style={{ maxWidth: 820 }}><span className="eyebrow">Enquiry Form</span><h2 style={{ marginTop: 12 }}>Tell us what you need.</h2><p style={{ marginTop: 12 }}>Complete the form and a member of our team will respond using the details you provide.</p><a className="btn btn-solid" href="mailto:info.dubai@kasumigaseki.co.jp" style={{ marginTop: 22 }}>Email our team</a><p style={{ marginTop: 12, color: "var(--grey-5)", fontSize: ".86rem" }}>Enquiries currently open your email client; CRM submission is scheduled for Phase 3.</p></div></section>
  </main>;
}
