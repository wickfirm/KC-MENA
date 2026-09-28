import type { Metadata } from "next";
import { getPageBySlug } from "@/lib/pages";
import { getSiteSettings } from "@/lib/settings";
import "./contact.css";
import { DEFAULT_CONTACT_CONTENT, isContactContent } from "@/lib/contact-content";
import EnquiryForm from "@/components/site/EnquiryForm";

export const dynamic = "force-dynamic";
export async function generateMetadata(): Promise<Metadata> { const page = await getPageBySlug("contact-us"); return { title: page?.seo?.title || "Contact Us", description: page?.seo?.description, alternates: { canonical: "https://kasumigaseki.ae/contact-us/" } }; }

const MAP_URLS: Record<string, string> = {
  "Dubai Office": "https://maps.app.goo.gl/xESmJtGHPZvotgkJ6",
  "Sales Centre": "https://maps.app.goo.gl/xESmJtGHPZvotgkJ6",
  "Miami Location": "https://www.google.com/maps/search/?api=1&query=Miami+Florida",
  "Kasumigaseki Restaurant": "https://maps.app.goo.gl/i2oFuHW3icgJj1378?g_st=ac",
};

export default async function ContactPage() {
  const [page, settings] = await Promise.all([getPageBySlug("contact-us"), getSiteSettings()]);
  const content = isContactContent(page?.content) ? page.content : DEFAULT_CONTACT_CONTENT;
  return <main>
    <section className="hero-band" style={{ "--hero-image": "url('/images/office.webp')" } as React.CSSProperties}><div className="wrap"><h1>{content.heroTitle}</h1></div></section>
    <section className="section">
      <div className="wrap">
        <div className="loc-grid">
          {content.locations.map((location) => (
            <div className="loc-card" key={location.title}>
              <h3>{location.title}</h3>
              <p>{location.address.split("\n").map((line, index, lines) => <span key={index}>{line}{index < lines.length - 1 && <br />}</span>)}</p>
              <a href={location.mapUrl || MAP_URLS[location.title] || "https://maps.app.goo.gl/xESmJtGHPZvotgkJ6"} className="maplink" target="_blank" rel="noreferrer">Get Directions &#8599;</a>
            </div>
          ))}
        </div>
      </div>
    </section>
    <EnquiryForm phone={settings.contact.phone} email={settings.contact.email} eyebrow={content.enquiryEyebrow} heading={content.enquiryHeading} body={content.enquiryBody} />
  </main>;
}