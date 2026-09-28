import Link from "next/link";
import type { BusinessCallout, BusinessDetailContent } from "@/lib/business-detail-content";

const ARROW = (
  <svg width="13" height="9" viewBox="0 0 14 10" fill="none" aria-hidden="true">
    <path d="M1 5H13M13 5L9 1M13 5L9 9" stroke="white" strokeWidth="1.2" />
  </svg>
);

/** Business-page callout band. Three delivered variants:
 *  "map" (global-location strip), "ir" (two-column IR band), "generic". */
export default function BusinessCalloutBand({ callout, locations }: { callout: BusinessCallout; locations?: BusinessDetailContent["locations"] }) {
  if (callout.variant === "map") {
    return (
      <section className="section global-map-cta" style={{ paddingTop: 72, paddingBottom: 56 }}>
        <div className="wrap">
          <div className="head">
            <span className="eyebrow">{callout.eyebrow}</span>
            <h2>{callout.heading}</h2>
            <p className="intro-reg" style={{ marginTop: 16 }}>{callout.body}</p>
            {locations && locations.length > 0 && (
              <div className="global-location-strip" aria-label="Global business locations">
                {locations.map((location) => (
                  <div className="global-location-card" key={location.city}>
                    <div className="global-location-photo">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={location.image} alt={`${location.city}, ${location.country}`} loading="lazy" />
                    </div>
                    <span>{location.country}</span>
                    <strong>{location.city}</strong>
                    <p>{location.line}</p>
                    <a href={location.mapUrl} target="_blank" rel="noopener">View on map &#8599;</a>
                  </div>
                ))}
              </div>
            )}
            <Link href={callout.href} className="btn btn-solid" style={{ marginTop: 26 }} target="_blank" rel="noreferrer">
              {callout.label} {ARROW}
            </Link>
          </div>
        </div>
      </section>
    );
  }
  if (callout.variant === "ir") {
    return (
      <section className="section ir-redirect" style={{ paddingTop: 40 }}>
        <div className="wrap">
          <div className="ir-grid">
            <div>
              <span className="eyebrow">{callout.eyebrow}</span>
              <h2 style={{ marginTop: 14 }}>{callout.heading}</h2>
              <p className="intro-reg" style={{ marginTop: 16 }}>{callout.body}</p>
            </div>
            <div className="ir-cta">
              <Link href={callout.href} className="btn btn-solid" target="_blank" rel="noreferrer">
                {callout.label} {ARROW}
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }
  return (
    <section className="section" style={{ background: "var(--grey-1)" }}>
      <div className="wrap">
        <span className="eyebrow">{callout.eyebrow}</span>
        <h2 style={{ marginTop: 12 }}>{callout.heading}</h2>
        <p style={{ maxWidth: 650, marginTop: 12 }}>{callout.body}</p>
        <Link href={callout.href} className="btn btn-outline" target="_blank" rel="noreferrer" style={{ marginTop: 22 }}>
          {callout.label}
        </Link>
      </div>
    </section>
  );
}