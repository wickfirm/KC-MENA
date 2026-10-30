import type { Metadata } from "next";
import { clientHeroBackground } from "@/lib/client-css";
import ClientPageCss from "@/components/site/ClientPageCss";
import { getPageBySlug } from "@/lib/pages";
import { getSiteSettings } from "@/lib/settings";
import { notFound } from "next/navigation";
import { isContactContent } from "@/lib/contact-content";
import EnquiryForm from "@/components/site/EnquiryForm";
import JsonLd from "@/components/site/JsonLd";
import { fixedPageJsonLd, pageMetadata, resolvePageSeo } from "@/lib/seo";

export const dynamic = "force-dynamic";
export async function generateMetadata(): Promise<Metadata> { const page = await getPageBySlug("contact-us"); return pageMetadata(resolvePageSeo("contact-us", page?.seo)); }

export default async function ContactPage() {
  const [page, settings] = await Promise.all([getPageBySlug("contact-us"), getSiteSettings()]);
  if (!isContactContent(page?.content)) notFound();
  const content = page.content;
  return <><ClientPageCss page="contact-us" /><main>
    <section className="hero-band" style={clientHeroBackground("contact-us", content.heroImage)}><div className="wrap"><h1>{content.heroTitle}</h1></div></section>
    <section className="section">
      <div className="wrap">
        <div className="loc-grid">
          {content.locations.map((location) => (
            <div className="loc-card" key={location.title}>
              <h3>{location.title}</h3>
              <p>{location.address.split("\n").map((line, index, lines) => <span key={index}>{line}{index < lines.length - 1 && <br />}</span>)}</p>
              {location.mapUrl && <a href={location.mapUrl} className="maplink" target="_blank" rel="noreferrer">{content.directionsLabel}</a>}
            </div>
          ))}
        </div>
      </div>
    </section>
    <EnquiryForm phone={settings.contact.phone} email={settings.contact.email} eyebrow={content.enquiryEyebrow} heading={content.enquiryHeading} body={content.enquiryBody} directPrompt={content.directPrompt} submitLabel={content.submitLabel} successMessage={content.successMessage} nameLabel={content.nameLabel} emailLabel={content.emailLabel} phoneLabel={content.phoneLabel} subjectLabel={content.subjectLabel} messageLabel={content.messageLabel} />
  </main><JsonLd data={fixedPageJsonLd("contact-us", resolvePageSeo("contact-us", page?.seo), "ContactPage")} /></>;
}