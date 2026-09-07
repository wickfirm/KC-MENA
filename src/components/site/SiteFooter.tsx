/** Same markup as the delivered static footer. */
export default function SiteFooter() {
  return (
    <footer id="contact">
      <div className="wrap">
        <div className="foot-grid foot-grid-enhanced">
          <div className="foot-brand">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="footer-logo" src="/images/logo kme red.png" alt="Kasumigaseki Capital" />
            <p className="foot-brand-copy">
              Kasumigaseki MENA connects regional opportunity with the discipline, capital strength,
              and operating expertise of Kasumigaseki Capital.
            </p>
            <div className="foot-address">
              Dubai Hills Estate, Business Park 4, Office 304-305<br />
              Dubai, United Arab Emirates
            </div>
            <div className="foot-social" aria-label="External links">
              <a className="foot-social-link" href="https://ae.linkedin.com/company/kasumigasekimiddleeast" target="_blank" rel="noopener" aria-label="Kasumigaseki MENA on LinkedIn" title="LinkedIn">
                <span className="social-icon social-icon-linkedin" aria-hidden="true">in</span>
              </a>
              <a className="foot-social-link" href="https://kasumigaseki.co.jp/en/" target="_blank" rel="noopener" aria-label="Kasumigaseki Capital corporate website" title="Corporate Website">
                <span className="social-icon social-icon-globe" aria-hidden="true"></span>
              </a>
            </div>
          </div>
          <div>
            <h4>Company</h4>
            <ul>
              <li><a href="/about-us/">About Us</a></li>
              <li><a href="/careers/">Careers</a></li>
              <li><a href="/news/">News</a></li>
              <li><a href="/contact-us/">Contact Us</a></li>
            </ul>
          </div>
          <div>
            <h4>Local Business</h4>
            <ul>
              <li><a href="/local-business/">Overview</a></li>
              <li><a href="/real-estate-development/">Development</a></li>
              <li><a href="/real-estate/">Investment &amp; Asset Management</a></li>
              <li><a href="/f-and-b/">Food &amp; Beverage</a></li>
            </ul>
          </div>
          <div>
            <h4>Global Business</h4>
            <ul>
              <li><a href="/global-businesses/">Overview</a></li>
              <li><a href="https://map.kasumigaseki.ae/" target="_blank" rel="noopener">Global Map</a></li>
              <li><a href="https://logiflag.com/" target="_blank" rel="noopener">Logistics</a></li>
              <li><a href="https://favhospitalitygroup.com/" target="_blank" rel="noopener">Hotel Business</a></li>
              <li><a href="https://kc-welfare.co.jp/" target="_blank" rel="noopener">Healthcare</a></li>
            </ul>
          </div>
          <div>
            <h4>Media &amp; Resources</h4>
            <ul>
              <li><a href="https://kasumigaseki.co.jp/en/ir/" target="_blank" rel="noopener">Parent IR</a></li>
              <li><a href="https://kasumigaseki.co.jp/en/" target="_blank" rel="noopener">Kasumigaseki Capital</a></li>
              <li><a href="/news/">News</a></li>
            </ul>
          </div>
          <div>
            <h4>Legal &amp; Contact</h4>
            <ul>
              <li><a href="/terms-and-conditions/">Terms &amp; Conditions</a></li>
              <li><a href="/privacy-policy/">Privacy Policy</a></li>
              <li><a href="/cookie-policy/">Cookie Policy</a></li>
              <li><a href="/legal-notice/">Legal Notice</a></li>
              <li><a href="/faq/">FAQ</a></li>
              <li><a href="tel:+97143883099">+971 43 88 3099</a></li>
              <li><a href="mailto:info.dubai@kasumigaseki.co.jp">info.dubai@kasumigaseki.co.jp</a></li>
            </ul>
          </div>
        </div>
        <div className="foot-bottom">
          <span>&copy; {new Date().getFullYear()} Kasumigaseki Capital MENA. All rights reserved.</span>
          <div className="foot-bottom-links">
            <a href="/terms-and-conditions/">Terms</a>
            <a href="/privacy-policy/">Privacy</a>
            <a href="/cookie-policy/">Cookies</a>
            <a href="/legal-notice/">Legal Notice</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
