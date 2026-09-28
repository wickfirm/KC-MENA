"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { NavItem } from "@/lib/settings";

const FALLBACK_NAV: NavItem[] = [
  { href: "/about-us", label: "About Us" },
  { href: "/local-business", label: "Local Business" },
  { href: "/global-businesses", label: "Global Business" },
  { href: "/news", label: "News" },
  { href: "/careers", label: "Careers" },
];

type Props = {
  nav?: NavItem[];
  onContactHover?: () => void;
  onContactLeave?: () => void;
  drawerOpen?: boolean;
};

/** Same markup/behaviour as the delivered header. The mobile nav toggle and
 *  contact-drawer triggers are handled here (no external JS). */
export default function SiteHeader({ nav = FALLBACK_NAV, onContactHover, onContactLeave, drawerOpen = false }: Props) {
  const pathname = usePathname();
  const items = nav.length ? nav : FALLBACK_NAV;
  const [navOpen, setNavOpen] = useState(false);

  // The delivered mobile-menu CSS keys off body.nav-open.
  useEffect(() => {
    document.body.classList.toggle("nav-open", navOpen);
    return () => document.body.classList.remove("nav-open");
  }, [navOpen]);

  return (
    <header className="site-header">
      <div className="header-in">
        <Link href="/" className="logo-lockup" aria-label="Kasumigaseki Capital home">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="site-logo" src="/images/logo kme dark.png" alt="Kasumigaseki Capital" />
        </Link>
        <nav id="mainnav" aria-label="Primary">
          <ul>
            {items.map((item) => {
              const active = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={active ? "active" : undefined}
                    onClick={() => setNavOpen(false)}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="header-cta">
          <a
            href="/contact-us/"
            id="contactTrigger"
            className="contact-link"
            aria-expanded={drawerOpen}
            onMouseEnter={onContactHover}
            onMouseLeave={onContactLeave}
            onClick={(event) => {
              event.preventDefault();
              onContactHover?.();
              setNavOpen(false);
            }}
          >
            Contact Us{" "}
            <svg width="10" height="10" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <path d="M2 10L10 2M10 2H3M10 2V9" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </a>
          <button
            className="nav-toggle"
            id="navToggle"
            aria-label="Menu"
            aria-expanded={navOpen}
            aria-controls="mainnav"
            onClick={() => setNavOpen((open) => !open)}
          >
            <span></span><span></span><span></span>
          </button>
        </div>
      </div>
    </header>
  );
}
