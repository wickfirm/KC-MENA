import type { SiteSettings } from "@/lib/settings";

/** Same markup as the delivered static footer, with content from site settings. */
export default function SiteFooter({ settings }: { settings: SiteSettings }) {
  const { contact, address, brand, links, footerColumns, copyright, bottomLinks, chrome } = settings;
  return (
    <footer id="contact">
      <div className="wrap">
        <div className="foot-grid foot-grid-enhanced">
          <div className="foot-brand">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="footer-logo" src="/images/logo kme red.png" alt={chrome.logoAlt} />
            <p className="foot-brand-copy">{brand.footerCopy}</p>
            <div className="foot-address">
              {address.lines.map((line, index) => (
                <span key={index}>
                  {line}
                  {index < address.lines.length - 1 && <br />}
                </span>
              ))}
            </div>
            <div className="foot-social" aria-label="External links">
              {links.linkedin && (
                <a className="foot-social-link" href={links.linkedin} target="_blank" rel="noopener" aria-label="Kasumigaseki MENA on LinkedIn" title="LinkedIn">
                  <span className="social-icon social-icon-linkedin" aria-hidden="true">in</span>
                </a>
              )}
              {links.corporate && (
                <a className="foot-social-link" href={links.corporate} target="_blank" rel="noopener" aria-label="Kasumigaseki Capital corporate website" title="Corporate Website">
                  <span className="social-icon social-icon-globe" aria-hidden="true"></span>
                </a>
              )}
            </div>
          </div>
          {footerColumns.map((column) => (
            <div key={column.heading}>
              <h4>{column.heading}</h4>
              <ul>
                {column.links.map((link) => (
                  <li key={`${column.heading}-${link.href}-${link.label}`}>
                    <a href={link.href} target={link.href.startsWith("http") ? "_blank" : undefined} rel={link.href.startsWith("http") ? "noopener" : undefined}>{link.label}</a>
                  </li>
                ))}
                {column.heading === "Legal & Contact" && contact.phone && <li><a href={`tel:${contact.phone.replace(/\s/g, "")}`}>{contact.phone}</a></li>}
                {column.heading === "Legal & Contact" && contact.email && <li><a href={`mailto:${contact.email}`}>{contact.email}</a></li>}
              </ul>
            </div>
          ))}
        </div>
        <div className="foot-bottom">
          <span>{copyright.replace("{year}", String(new Date().getFullYear()))}</span>
          <div className="foot-bottom-links">
            {bottomLinks.map((link) => <a key={link.href + link.label} href={link.href}>{link.label}</a>)}
          </div>
        </div>
      </div>
    </footer>
  );
}
