import SectionContactForm from "./SectionContactForm";

export type SectionContactProps = {
  eyebrow?: string;
  heading: string;
  officeTitle: string;
  officeLines: string[];
  mapUrl?: string;
  mapLabel?: string;
  contactTitle: string;
  contactBody: string;
  phone: string;
  email: string;
  subjectLabel?: string;
  subjectPlaceholder?: string;
};

/** "Contact us" band shared by Local Business and the four business pages —
 *  markup mirrors the delivered static contact sections (.head + .contact-grid). */
export default function SectionContact({
  eyebrow = "Contact Us",
  heading,
  officeTitle,
  officeLines,
  mapUrl,
  mapLabel = "Open in Maps ↗",
  contactTitle,
  contactBody,
  phone,
  email,
  subjectLabel = "Enquiry Type",
  subjectPlaceholder,
}: SectionContactProps) {
  return (
    <section className="section" id="contact">
      <div className="wrap">
        <div className="head">
          <span className="eyebrow">{eyebrow}</span>
          <h2>{heading}</h2>
        </div>
        <div className="contact-grid">
          <div className="contact-info">
            <div className="block">
              <h3>{officeTitle}</h3>
              <p>
                {officeLines.map((line, index) => (
                  <span key={index}>
                    {line}
                    {index < officeLines.length - 1 && <br />}
                  </span>
                ))}
              </p>
              {mapUrl && (
                <a href={mapUrl} className="visit" target="_blank" rel="noreferrer" style={{ marginTop: 12 }}>
                  {mapLabel}
                </a>
              )}
            </div>
            <div className="block">
              <h3>{contactTitle}</h3>
              <p>{contactBody}</p>
              <p style={{ marginTop: 10 }}>
                <a href={`tel:${phone.replace(/\s/g, "")}`}>{phone}</a>
              </p>
              <p>
                <a href={`mailto:${email}`}>{email}</a>
              </p>
            </div>
          </div>
          <SectionContactForm subjectLabel={subjectLabel} subjectPlaceholder={subjectPlaceholder} subject={heading} />
        </div>
      </div>
    </section>
  );
}