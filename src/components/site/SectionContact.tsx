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
  submitLabel?: string;
  successMessage?: string;
  nameLabel?: string;
  emailLabel?: string;
  phoneLabel?: string;
  messageLabel?: string;
  hidden?: boolean;
  recipientEmail?: string;
  emailSubject?: string;
  delivery?: "inbox" | "email" | "both";
  errorMessage?: string;
};

/** "Contact us" band shared by Local Business and the four business pages —
 *  markup mirrors the delivered static contact sections (.head + .contact-grid). */
export default function SectionContact({
  eyebrow = "",
  heading,
  officeTitle,
  officeLines,
  mapUrl,
  mapLabel = "",
  contactTitle,
  contactBody,
  phone,
  email,
  subjectLabel = "Enquiry Type",
  subjectPlaceholder,
  submitLabel,
  successMessage,
  nameLabel,
  emailLabel,
  phoneLabel,
  messageLabel,
  hidden,
  recipientEmail,
  emailSubject,
  delivery,
  errorMessage,
}: SectionContactProps) {
  if (hidden) return null;
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
              {contactBody ? <p>{contactBody}</p> : null}
              <p style={{ marginTop: 10 }}>
                <a href={`tel:${phone.replace(/\s/g, "")}`}>{phone}</a>
              </p>
              <p>
                <a href={`mailto:${email}`}>{email}</a>
              </p>
            </div>
          </div>
          <SectionContactForm subjectLabel={subjectLabel} subjectPlaceholder={subjectPlaceholder} submitLabel={submitLabel} successNote={successMessage} subject={emailSubject || heading} nameLabel={nameLabel} emailLabel={emailLabel} phoneLabel={phoneLabel} messageLabel={messageLabel} recipientEmail={recipientEmail} emailSubject={emailSubject} delivery={delivery} errorMessage={errorMessage} />
        </div>
      </div>
    </section>
  );
}
