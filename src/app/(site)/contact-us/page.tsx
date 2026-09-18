import type { Metadata } from "next";
import { getPageBySlug } from "@/lib/pages";
import { DEFAULT_CONTACT_CONTENT, isContactContent } from "@/lib/contact-content";
import ContactForm from "@/components/site/ContactForm";

export const dynamic = "force-dynamic";
export async function generateMetadata(): Promise<Metadata> { const page = await getPageBySlug("contact-us"); return { title: page?.seo?.title || "Contact Us", description: page?.seo?.description, alternates: { canonical: "https://kasumigaseki.ae/contact-us/" } }; }

export default async function ContactPage() {
  const page = await getPageBySlug("contact-us"); const content = isContactContent(page?.content) ? page.content : DEFAULT_CONTACT_CONTENT;
  return <main><section className="hero-band" style={{ "--hero-image": "url('/images/office.webp')" } as React.CSSProperties}><div className="wrap"><h1>{content.heroTitle}</h1></div></section>
    <section className="section"><div className="wrap"><span className="eyebrow">Our locations</span><div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 18, marginTop: 24 }}>{content.locations.map((location) => <article className="card" key={location.title}><h2 style={{ fontSize: "1.2rem" }}>{location.title}</h2><p style={{ whiteSpace: "pre-line", marginTop: 10, color: "var(--grey-6)" }}>{location.address}</p></article>)}</div></div></section>
    <section className="section" style={{ background: "var(--grey-1)" }}><div className="wrap" style={{ maxWidth: 820 }}><span className="eyebrow">{content.enquiryEyebrow}</span><h2 style={{ marginTop: 12 }}>{content.enquiryHeading}</h2><p style={{ marginTop: 12 }}>{content.enquiryBody}</p><ContactForm /></div></section>
  </main>;
}
