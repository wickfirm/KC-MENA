"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import SiteHeader from "./SiteHeader";
import ContactDrawer from "./ContactDrawer";
import CookieConsent from "./CookieConsent";
import type { SiteSettings } from "@/lib/settings";

/** Client chrome shell: owns the contact-drawer open state (hover-to-open,
 *  auto-close after 350ms, Escape/backdrop/button to close) and the mobile
 *  nav state; this replaces the delivered site.js with React state. */
export default function SiteChrome({ children, footer, settings }: { children: ReactNode; footer: ReactNode; settings: SiteSettings }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const openDrawer = useCallback(() => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setDrawerOpen(true);
  }, []);

  const closeDrawer = useCallback(() => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setDrawerOpen(false);
  }, []);

  const scheduleDrawerClose = useCallback(() => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setDrawerOpen(false), 350);
  }, []);

  // Escape closes the drawer (same as the delivered behaviour).
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") closeDrawer();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [closeDrawer]);

  // Any "/contact-us/" link opens the drawer instead of navigating
  // (covers footer + in-page links, matching the delivered site.js delegation).
  useEffect(() => {
    function onClick(event: MouseEvent) {
      const target = event.target as HTMLElement | null;
      const link = target?.closest?.('a[href="/contact-us/"]') as HTMLAnchorElement | null;
      if (link) {
        event.preventDefault();
        openDrawer();
      }
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [openDrawer]);

  return (
    <>
      <SiteHeader onContactHover={openDrawer} onContactLeave={scheduleDrawerClose} drawerOpen={drawerOpen} />
      {children}
      {footer}
      <ContactDrawer settings={settings} open={drawerOpen} onClose={closeDrawer} onHoverKeep={() => { if (closeTimer.current) clearTimeout(closeTimer.current); }} onHoverLeave={scheduleDrawerClose} />
      <CookieConsent />
    </>
  );
}