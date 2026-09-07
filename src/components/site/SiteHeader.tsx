"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/about-us", label: "About Us" },
  { href: "/local-business", label: "Local Business" },
  { href: "/global-businesses", label: "Global Business" },
  { href: "/news", label: "News" },
  { href: "/careers", label: "Careers" },
];

/** Same markup/behaviour as the delivered static header (site.js drives the
 *  mobile nav toggle + contact drawer via the same element IDs). */
export default function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="site-header">
      <div className="header-in">
        <Link href="/" className="logo-lockup" aria-label="Kasumigaseki Capital home">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="site-logo" src="/images/logo kme dark.png" alt="Kasumigaseki Capital" />
        </Link>
        <nav id="mainnav" aria-label="Primary">
          <ul>
            {NAV.map((item) => {
              const active = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <li key={item.href}>
                  <Link href={item.href} className={active ? "active" : undefined}>
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="header-cta">
          <a href="/contact-us/" id="contactTrigger" className="contact-link">
            Contact Us{" "}
            <svg width="10" height="10" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <path d="M2 10L10 2M10 2H3M10 2V9" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </a>
          <button className="nav-toggle" id="navToggle" aria-label="Menu" aria-expanded="false" aria-controls="mainnav">
            <span></span><span></span><span></span>
          </button>
        </div>
      </div>
    </header>
  );
}
