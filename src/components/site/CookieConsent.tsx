"use client";

import { useEffect, useState } from "react";
import type { CookieCopy } from "@/lib/settings";

type Consent = { status: string; essential: boolean; analytics: boolean; media: boolean; updatedAt: string };

const CONSENT_KEY = "kmeCookieConsentV1";

function readConsent(): Consent | null {
  try {
    const stored = window.localStorage.getItem(CONSENT_KEY);
    return stored ? (JSON.parse(stored) as Consent) : null;
  } catch {
    return null;
  }
}

function writeConsent(status: string, analytics: boolean, media: boolean): Consent {
  const consent: Consent = { status, essential: true, analytics, media, updatedAt: new Date().toISOString() };
  (window as unknown as { kmeCookieConsent?: Consent }).kmeCookieConsent = consent;
  try {
    window.localStorage.setItem(CONSENT_KEY, JSON.stringify(consent));
  } catch {}
  return consent;
}

/** Cookie & usage consent banner — React port of the delivered consent logic
 *  (same markup classes, same localStorage key kmeCookieConsentV1). */
export default function CookieConsent({ copy }: { copy: CookieCopy }) {
  const [visible, setVisible] = useState(false);
  const [manage, setManage] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [media, setMedia] = useState(false);

  useEffect(() => {
    const existing = readConsent();
    setAnalytics(Boolean(existing?.analytics));
    setMedia(Boolean(existing?.media));
    if (!existing) setVisible(true);

    // "Cookie settings" buttons anywhere on the page reopen the banner.
    function onClick(event: MouseEvent) {
      const target = event.target as HTMLElement | null;
      if (target?.closest?.("[data-cookie-settings]")) {
        setManage(true);
        setVisible(true);
      }
    }
    document.addEventListener("click", onClick);
    (window as unknown as { openCookieSettings?: () => void }).openCookieSettings = () => {
      setManage(true);
      setVisible(true);
    };
    return () => document.removeEventListener("click", onClick);
  }, []);

  function save(status: string, withAnalytics: boolean, withMedia: boolean) {
    writeConsent(status, withAnalytics, withMedia);
    setVisible(false);
    setManage(false);
  }

  if (!visible) return null;

  return (
    <aside className={`cookie-consent${manage ? " open manage" : " open"}`} role="dialog" aria-modal="false" aria-labelledby="cookieConsentTitle" aria-describedby="cookieConsentText">
      <div className="cookie-consent-panel">
        <div>
          <h2 id="cookieConsentTitle">{copy.title}</h2>
          <p id="cookieConsentText">
            {copy.body}{" "}
            <a href={copy.policyHref}>{copy.policyLabel}</a>.
          </p>
        </div>
        <div className="cookie-consent-actions">
          <button type="button" className="cookie-manage" onClick={() => setManage(true)}>
            {copy.manageLabel}
          </button>
          <button type="button" className="cookie-necessary" onClick={() => save("necessary", false, false)}>
            {copy.necessaryLabel}
          </button>
          <button type="button" className="cookie-primary cookie-accept" onClick={() => save("accepted", true, true)}>
            {copy.acceptLabel}
          </button>
        </div>
        <div className="cookie-consent-preferences" aria-label="Cookie preferences">
          <label className="cookie-choice">
            <span>
              <strong>{copy.essentialTitle}</strong>
              <span>{copy.essentialBody}</span>
            </span>
            <input type="checkbox" checked disabled />
          </label>
          <label className="cookie-choice">
            <span>
              <strong>{copy.analyticsTitle}</strong>
              <span>{copy.analyticsBody}</span>
            </span>
            <input type="checkbox" checked={analytics} onChange={(event) => setAnalytics(event.target.checked)} />
          </label>
          <label className="cookie-choice">
            <span>
              <strong>{copy.mediaTitle}</strong>
              <span>{copy.mediaBody}</span>
            </span>
            <input type="checkbox" checked={media} onChange={(event) => setMedia(event.target.checked)} />
          </label>
          <div className="cookie-consent-actions">
            <button type="button" className="cookie-necessary" onClick={() => save("necessary", false, false)}>
              {copy.necessaryLabel}
            </button>
            <button type="button" className="cookie-primary cookie-save" onClick={() => save("custom", analytics, media)}>
              {copy.saveLabel}
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}