/**
 * Shared renderer for legal pages (Privacy Policy, Terms & Conditions,
 * Cookie Policy, Legal Notice). Mirrors the delivered static markup so the
 * existing styles in /css/site.css apply unchanged.
 */
export default function LegalPageView({
  title,
  meta,
  body,
}: {
  title: string;
  meta?: string;
  body?: string;
}) {
  return (
    <>
      <section className="legal-hero">
        <div className="wrap">
          <span className="eyebrow">Legal</span>
          <h1>{title}</h1>
        </div>
      </section>
      <section className="section legal-content">
        <div className="wrap legal-wrap">
          <aside className="legal-meta" dangerouslySetInnerHTML={{ __html: meta ?? "" }} />
          <div className="legal-body" dangerouslySetInnerHTML={{ __html: body ?? "" }} />
        </div>
      </section>
    </>
  );
}
