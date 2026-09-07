/** Same markup + IDs as the delivered static contact drawer —
 *  /js/site.js continues to drive open/close and the mailto fallback. */
export default function ContactDrawer() {
  return (
    <>
      <div className="contact-backdrop" id="contactBackdrop"></div>
      <aside className="contact-drawer" id="contactDrawer" aria-label="Contact Kasumigaseki Capital">
        <button className="drawer-close" id="drawerClose" aria-label="Close">&times;</button>
        <div className="drawer-inner">
          <span className="eyebrow">Get in Touch</span>
          <h2 style={{ marginTop: 12, fontSize: "clamp(1.3rem,2vw,1.6rem)" }}>Contact Us</h2>
          <p style={{ marginTop: 12, color: "var(--grey-6)", fontSize: "0.92rem" }}>
            Reach the Kasumigaseki MENA team, or visit one of our company locations.
          </p>

          <div className="drawer-locs">
            <div className="drawer-loc">
              <h4>Dubai Office</h4>
              <p>Dubai Hills Estate<br />Business Park 4, Office 304-305<br />Dubai, UAE</p>
              <a href="https://maps.app.goo.gl/xESmJtGHPZvotgkJ6" className="maplink">Get Directions &#8599;</a>
            </div>
            <div className="drawer-loc">
              <h4>Sales Centre</h4>
              <p>Business Bay<br />Dubai, UAE</p>
              <a href="https://maps.app.goo.gl/xESmJtGHPZvotgkJ6" className="maplink">Get Directions &#8599;</a>
            </div>
            <div className="drawer-loc">
              <h4>Miami Location</h4>
              <p>Miami, Florida<br />United States</p>
              <a href="https://www.google.com/maps/search/?api=1&amp;query=Miami+Florida" className="maplink">Get Directions &#8599;</a>
            </div>
            <div className="drawer-loc">
              <h4>Kasumigaseki Restaurant</h4>
              <p>Vida Emirates Hills<br />Dubai, UAE</p>
              <a href="https://maps.app.goo.gl/i2oFuHW3icgJj1378?g_st=ac" className="maplink">Get Directions &#8599;</a>
            </div>
          </div>

          <form className="drawer-form" onSubmit={(e) => e.preventDefault()}>
            {/* NOTE: real submission handler lands in Phase 3 (Salesforce dual-write). */}
            <div className="form-field">
              <label htmlFor="dname">Full Name</label>
              <input type="text" id="dname" name="name" required />
            </div>
            <div className="form-field">
              <label htmlFor="demail">Email</label>
              <input type="email" id="demail" name="email" required />
            </div>
            <div className="form-field">
              <label htmlFor="dmessage">Message</label>
              <textarea id="dmessage" name="message" required></textarea>
            </div>
            <button type="submit" className="btn btn-solid" style={{ width: "100%", justifyContent: "center" }}>
              Send Enquiry
            </button>
            <div className="form-note" id="drawerNote">Opening your email app to send this inquiry.</div>
          </form>

          <div className="drawer-direct">
            Prefer to reach us directly?
            <a href="tel:+97143883099">+971 43 88 3099</a>
            <a href="mailto:info.dubai@kasumigaseki.co.jp">info.dubai@kasumigaseki.co.jp</a>
          </div>
        </div>
      </aside>
    </>
  );
}
